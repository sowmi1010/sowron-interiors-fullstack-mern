import { Suspense } from "react";
import { RouterProvider } from "react-router-dom";
import { router } from "./router/index.jsx";

export default function App() {
  return (
    <Suspense fallback={<div className="text-white p-10">Loading...</div>}>
      <RouterProvider router={router} />
    </Suspense>
  );
}
