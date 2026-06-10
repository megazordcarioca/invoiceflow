import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">404</h1>
        <p className="text-gray-600 mb-8">Page not found</p>
        <Link href="/" className="px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700">
          Go home
        </Link>
      </div>
    </div>
  );
}
