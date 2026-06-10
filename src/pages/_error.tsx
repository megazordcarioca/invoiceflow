import type { NextPageContext } from "next";

function Error({ statusCode }: { statusCode?: number }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          {statusCode || 500}
        </h1>
        <p className="text-gray-600">
          {statusCode === 404
            ? "Page not found"
            : "Something went wrong"}
        </p>
      </div>
    </div>
  );
}

Error.getInitialProps = ({ res, err }: NextPageContext) => {
  const statusCode = res ? res.statusCode : err ? err.statusCode : 404;
  return { statusCode };
};

export default Error;
