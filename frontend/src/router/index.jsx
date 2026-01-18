// src/router/index.js
import { lazy } from "react";
import { createBrowserRouter } from "react-router-dom";
import AdminRoute from "../auth/AdminRoute.jsx";
import AdminLayout from "../components/layouts/AdminLayout.jsx";
import PublicLayout from "../components/layouts/PublicLayout.jsx";

/* ---------------------- PUBLIC (Lazy Imports) ---------------------- */
const Home = lazy(() => import("../pages/Home.jsx"));
const Login = lazy(() => import("../pages/Login.jsx"));
const Register = lazy(() => import("../pages/Register.jsx"));

const Gallery = lazy(() => import("../pages/Gallery.jsx"));
const ViewGallery = lazy(() => import("../pages/ViewGallery.jsx"));

const Portfolio = lazy(() => import("../pages/Portfolio.jsx"));
const PortfolioSingle = lazy(() => import("../pages/PortfolioSingle.jsx"));

const Products = lazy(() => import("../pages/ProductsPage.jsx"));
const ProductView = lazy(() => import("../pages/ProductView.jsx"));

const BookDemo = lazy(() => import("../pages/BookDemo.jsx"));
const Estimate = lazy(() => import("../pages/Estimate.jsx"));

const Wishlist = lazy(() => import("../pages/Wishlist.jsx"));

/* ---------------------- ADMIN (DO NOT TOUCH) ---------------------- */
const AdminLogin = lazy(() => import("../pages/admin/AdminLogin.jsx"));
const AdminForgot = lazy(() => import("../pages/admin/AdminForgot.jsx"));
const AdminReset = lazy(() => import("../pages/admin/AdminReset.jsx"));
const AdminDashboard = lazy(() => import("../pages/admin/AdminDashboard.jsx"));

const ProductsAdd = lazy(() =>
  import("../pages/admin/products/ProductsAdd.jsx")
);
const ProductsList = lazy(() =>
  import("../pages/admin/products/ProductsList.jsx")
);
const EditProduct = lazy(() =>
  import("../pages/admin/products/EditProduct.jsx")
);

const AdminCategories = lazy(() =>
  import("../pages/admin/Categories/AdminCategories.jsx")
);

const GalleryAdmin = lazy(() =>
  import("../pages/admin/gallery/GalleryList.jsx")
);
const GalleryAdd = lazy(() => import("../pages/admin/gallery/GalleryAdd.jsx"));
const GalleryEdit = lazy(() =>
  import("../pages/admin/gallery/GalleryEdit.jsx")
);

const PortfolioAdd = lazy(() =>
  import("../pages/admin/portfolio/PortfolioAdd.jsx")
);
const PortfolioEdit = lazy(() =>
  import("../pages/admin/portfolio/PortfolioEdit.jsx")
);
const PortfolioList = lazy(() =>
  import("../pages/admin/portfolio/PortfolioList.jsx")
);

const EnquiriesAdmin = lazy(() =>
  import("../pages/admin/enquiries/EnquiriesAdmin.jsx")
);
const BookingsAdmin = lazy(() =>
  import("../pages/admin/bookings/BookingsAdmin.jsx")
);
const EstimatesAdmin = lazy(() =>
  import("../pages/admin/estimates/EstimatesAdmin.jsx")
);

const FeedbackAdmin = lazy(() =>
  import("../pages/admin/feedback/FeedbackList.jsx")
);
const FeedbackAdd = lazy(() =>
  import("../pages/admin/feedback/FeedbackAdd.jsx")
);
const FeedbackEdit = lazy(() =>
  import("../pages/admin/feedback/FeedbackEdit.jsx")
);

/* ---------------------- ROUTES ---------------------- */
export const router = createBrowserRouter([
  {
    element: <PublicLayout />,
    children: [
      { path: "/", element: <Home /> },
      { path: "/login", element: <Login /> },
      { path: "/register", element: <Register /> },

      { path: "/gallery", element: <Gallery /> },
      { path: "/view-gallery/:id", element: <ViewGallery /> },

      { path: "/portfolio", element: <Portfolio /> },
      { path: "/portfolio/:id", element: <PortfolioSingle /> },

      { path: "/products", element: <Products /> },
      { path: "/wishlist", element: <Wishlist /> },
      { path: "/products/:id", element: <ProductView /> },

      { path: "/book-demo", element: <BookDemo /> },
      { path: "/estimate", element: <Estimate /> },
    ],
  },

  /* ---------------------- ADMIN LOGIN ---------------------- */
  { path: "/admin/login", element: <AdminLogin /> },
  { path: "/admin/forgot", element: <AdminForgot /> },
  { path: "/admin/reset/:token", element: <AdminReset /> },
  /* ---------------------- ADMIN PROTECTED ---------------------- */
  {
    path: "/admin",
    element: (
      <AdminRoute>
        <AdminLayout />
      </AdminRoute>
    ),
    children: [
      { index: true, element: <AdminDashboard /> },

      /** PRODUCTS */
      { path: "products", element: <ProductsList /> },
      { path: "products/add", element: <ProductsAdd /> },
      { path: "product/edit/:id", element: <EditProduct /> },

      { path: "categories", element: <AdminCategories /> },

      /** PROTOFOLIO */
      { path: "portfolio", element: <PortfolioList /> },
      { path: "portfolio/add", element: <PortfolioAdd /> },
      { path: "portfolio/edit/:id", element: <PortfolioEdit /> },

      /** GALLERY */
      { path: "gallery", element: <GalleryAdmin /> },
      { path: "gallery/add", element: <GalleryAdd /> },
      { path: "gallery/edit/:id", element: <GalleryEdit /> },

      /** BOOKINGS / ENQUIRIES / ESTIMATES */
      { path: "bookings", element: <BookingsAdmin /> },
      { path: "enquiries", element: <EnquiriesAdmin /> },
      { path: "estimates", element: <EstimatesAdmin /> },

      /** FEEDBACK */
      { path: "feedback", element: <FeedbackAdmin /> },
      { path: "feedback/add", element: <FeedbackAdd /> },
      { path: "feedback/edit/:id", element: <FeedbackEdit /> },
    ],
  },
]);
