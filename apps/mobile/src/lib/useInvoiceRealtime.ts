import { useEffect, useState, useCallback } from "react";
import { supabase } from "./supabase";
import { Invoice } from "../types/invoice";
import { RealtimeChannel } from "@supabase/supabase-js";

type InvoiceRealtimeEvent = "INSERT" | "UPDATE" | "DELETE";

interface UseInvoiceRealtimeOptions {
  /**
   * Filter invoices by user_id. If not provided, uses the current authenticated user.
   */
  userId?: string;
  /**
   * Whether to enable the realtime subscription (default: true).
   */
  enabled?: boolean;
}

interface UseInvoiceRealtimeReturn {
  /**
   * Current list of invoices (initially loaded, then updated via realtime).
   */
  invoices: Invoice[];
  /**
   * Whether the initial load is in progress.
   */
  loading: boolean;
  /**
   * Error message if something went wrong.
   */
  error: string | null;
  /**
   * Manually refresh the invoice list.
   */
  refresh: () => Promise<void>;
}

/**
 * Hook to subscribe to real-time invoice changes for the current user.
 * Uses Supabase Realtime to listen for INSERT, UPDATE, DELETE events
 * on the invoices table filtered by user_id.
 */
export function useInvoiceRealtime(
  options: UseInvoiceRealtimeOptions = {}
): UseInvoiceRealtimeReturn {
  const { userId, enabled = true } = options;
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchInvoices = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Get current user if no userId provided
      let targetUserId = userId;
      if (!targetUserId) {
        const {
          data: { user },
          error: authError,
        } = await supabase.auth.getUser();
        if (authError || !user) {
          throw new Error("Not authenticated");
        }
        targetUserId = user.id;
      }

      // Fetch initial invoices
      const { data, error: fetchError } = await supabase
        .from("invoices")
        .select("*")
        .eq("user_id", targetUserId)
        .order("created_at", { ascending: false });

      if (fetchError) {
        throw new Error(fetchError.message);
      }

      setInvoices(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch invoices");
    } finally {
      setLoading(false);
    }
  }, [userId]);

  // Initial fetch
  useEffect(() => {
    if (enabled) {
      fetchInvoices();
    }
  }, [enabled, fetchInvoices]);

  // Realtime subscription
  useEffect(() => {
    if (!enabled) return;

    let channel: RealtimeChannel;

    const setupSubscription = async () => {
      try {
        // Get current user if no userId provided
        let targetUserId = userId;
        if (!targetUserId) {
          const {
            data: { user },
            error: authError,
          } = await supabase.auth.getUser();
          if (authError || !user) {
            throw new Error("Not authenticated");
          }
          targetUserId = user.id;
        }

        // Subscribe to invoice changes filtered by user_id
        channel = supabase
          .channel("invoices-changes")
          .on(
            "postgres_changes",
            {
              event: "*", // INSERT, UPDATE, DELETE
              schema: "public",
              table: "invoices",
              filter: `user_id=eq.${targetUserId}`,
            },
            (payload) => {
              const event = payload.eventType as InvoiceRealtimeEvent;
              const newRecord = payload.new as Invoice | undefined;
              const oldRecord = payload.old as Invoice | undefined;

              setInvoices((current) => {
                switch (event) {
                  case "INSERT":
                    if (newRecord) {
                      // Add new invoice at the beginning (newest first)
                      return [newRecord, ...current];
                    }
                    return current;

                  case "UPDATE":
                    if (newRecord) {
                      // Update existing invoice
                      return current.map((invoice) =>
                        invoice.id === newRecord.id ? newRecord : invoice
                      );
                    }
                    return current;

                  case "DELETE":
                    if (oldRecord) {
                      // Remove deleted invoice
                      return current.filter((invoice) => invoice.id !== oldRecord.id);
                    }
                    return current;

                  default:
                    return current;
                }
              });
            }
          )
          .subscribe((status) => {
            if (status === "SUBSCRIBED") {
              console.log("Subscribed to invoice changes");
            }
          });
      } catch (err) {
        console.error("Failed to setup realtime subscription:", err);
      }
    };

    setupSubscription();

    // Cleanup on unmount
    return () => {
      if (channel) {
        supabase.removeChannel(channel);
      }
    };
  }, [enabled, userId]);

  return {
    invoices,
    loading,
    error,
    refresh: fetchInvoices,
  };
}

export default useInvoiceRealtime;
