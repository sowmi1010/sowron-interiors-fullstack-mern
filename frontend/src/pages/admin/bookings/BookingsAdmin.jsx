import { useEffect, useMemo, useState } from "react";
import Pagination from "../../../components/ui/Pagination.jsx";
import { useSearch } from "../../../context/SearchContext";
import {
  Download,
  Trash2,
  MessageCircle,
} from "lucide-react";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import toast from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { api } from "../../../lib/api";

const PER_PAGE = 10;

export default function BookingsAdmin() {
  const [list, setList] = useState([]);
  const [page, setPage] = useState(1);
  const [deleteId, setDeleteId] = useState(null);

  const { query } = useSearch();
  const navigate = useNavigate();

  /* ================= LOAD ================= */
  const load = async () => {
    try {
      const res = await api.get("/booking");
      setList(res.data || []);
    } catch {
      toast.error("Session expired");
      navigate("/admin/login");
    }
  };

  useEffect(() => {
    load();
  }, []);

  /* ================= HELPERS ================= */
  const cleanPhone = (num = "") => num.split("_")[0];

  /* ================= SEARCH ================= */
  const filtered = useMemo(() => {
    const q = query.toLowerCase();
    return list.filter(
      (b) =>
        cleanPhone(b.phone).includes(q) ||
        b.city?.toLowerCase().includes(q) ||
        b.date?.toLowerCase().includes(q) ||
        b.time?.toLowerCase().includes(q) ||
        b.status?.toLowerCase().includes(q)
    );
  }, [list, query]);

  useEffect(() => setPage(1), [query]);

  const paginated = filtered.slice(
    (page - 1) * PER_PAGE,
    page * PER_PAGE
  );

  /* ================= EXCEL ================= */
  const exportExcel = () => {
    const rows = filtered.map((b, i) => ({
      S_No: i + 1,
      Phone: cleanPhone(b.phone),
      Date: b.date,
      Time: b.time,
      City: b.city,
      Status: b.status,
    }));

    const ws = XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Bookings");

    const buf = XLSX.write(wb, { bookType: "xlsx", type: "array" });
    saveAs(
      new Blob([buf], { type: "application/octet-stream" }),
      `Bookings_${Date.now()}.xlsx`
    );
  };

  /* ================= STATUS ================= */
  const changeStatus = async (id, status) => {
    try {
      await api.patch(`/booking/status/${id}`, { status });
      toast.success(`Status updated → ${status}`);
      load();
    } catch {
      toast.error("Status update failed");
    }
  };

  /* ================= DELETE ================= */
  const deleteBooking = async () => {
    try {
      await api.delete(`/booking/${deleteId}`);
      toast.success("Booking deleted");
      setDeleteId(null);
      load();
    } catch {
      toast.error("Delete failed");
    }
  };

  /* ================= WHATSAPP ================= */
  const sendWhatsapp = (phone, date, time) => {
    const num = cleanPhone(phone);
    const text = `Hello 👋, your booking with Sowron Interiors is confirmed!

📅 Date: ${date}
⏰ Time: ${time}

Thank you 🙏`;

    window.open(
      `https://wa.me/91${num}?text=${encodeURIComponent(text)}`,
      "_blank"
    );
  };

  /* ================= UI ================= */
  return (
    <div className="p-6 text-white max-w-[1400px] mx-auto">

      {/* HEADER */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-3xl font-semibold text-brand-red">
            User Bookings
          </h2>
          <p className="text-sm text-gray-400">
            Appointment requests & confirmations
          </p>
        </div>

        <button
          onClick={exportExcel}
          className="flex items-center gap-2
                     bg-brand-yellow text-black
                     px-4 py-2 rounded-lg
                     font-semibold shadow-glow"
        >
          <Download size={16} /> Export Excel
        </button>
      </div>

      {/* TABLE */}
      <div className="bg-black/60 backdrop-blur-xl
                      border border-white/10
                      rounded-2xl overflow-hidden shadow-glass">

        <table className="w-full text-sm">
          <thead className="bg-black/40 text-xs uppercase text-gray-400">
            <tr>
              <th className="p-4 text-left">Phone</th>
              <th>Date</th>
              <th>Time</th>
              <th>City</th>
              <th>Status</th>
              <th className="text-center">Actions</th>
            </tr>
          </thead>

          <tbody>
            {paginated.length === 0 ? (
              <tr>
                <td colSpan="6" className="py-16 text-center text-gray-500">
                  No bookings found
                </td>
              </tr>
            ) : (
              paginated.map((b) => (
                <tr
                  key={b._id}
                  className="border-t border-white/5
                             hover:bg-white/5 transition"
                >
                  <td className="p-4">{cleanPhone(b.phone)}</td>
                  <td>{b.date}</td>
                  <td>{b.time}</td>
                  <td>{b.city}</td>
                  <td>
                    <span className="px-3 py-1 rounded-full text-xs
                                     bg-white/10 text-gray-200">
                      {b.status}
                    </span>
                  </td>

                  <td className="text-center">
                    <div className="flex gap-2 justify-center flex-wrap">
                      <button
                        onClick={() => changeStatus(b._id, "confirmed")}
                        className="px-2 py-1 rounded bg-blue-600 text-xs"
                      >
                        Confirm
                      </button>
                      <button
                        onClick={() => changeStatus(b._id, "completed")}
                        className="px-2 py-1 rounded bg-green-600 text-xs"
                      >
                        Done
                      </button>
                      <button
                        onClick={() => changeStatus(b._id, "cancelled")}
                        className="px-2 py-1 rounded bg-red-600 text-xs"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={() =>
                          sendWhatsapp(b.phone, b.date, b.time)
                        }
                        className="px-2 py-1 rounded bg-green-700"
                      >
                        <MessageCircle size={12} />
                      </button>
                      <button
                        onClick={() => setDeleteId(b._id)}
                        className="px-2 py-1 rounded bg-red-700"
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* PAGINATION */}
      {filtered.length > PER_PAGE && (
        <div className="mt-8 flex justify-center">
          <Pagination
            page={page}
            total={filtered.length}
            limit={PER_PAGE}
            onChange={setPage}
          />
        </div>
      )}

      {/* DELETE MODAL */}
      <AnimatePresence>
        {deleteId && (
          <motion.div
            className="fixed inset-0 bg-black/60
                       flex items-center justify-center z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="bg-black/80 backdrop-blur-xl
                            border border-white/10
                            p-6 rounded-xl w-80 text-center">
              <p className="mb-4 text-gray-200">
                Delete this booking permanently?
              </p>
              <div className="flex justify-between">
                <button
                  onClick={() => setDeleteId(null)}
                  className="px-4 py-2 bg-gray-600 rounded"
                >
                  Cancel
                </button>
                <button
                  onClick={deleteBooking}
                  className="px-4 py-2 bg-red-600 rounded"
                >
                  Delete
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
