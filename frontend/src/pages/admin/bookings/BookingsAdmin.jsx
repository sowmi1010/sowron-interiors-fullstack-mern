import { useEffect, useMemo, useState } from "react";
import Pagination from "../../../components/ui/Pagination.jsx";
import { useSearch } from "../../../context/SearchContext";
import {
  Calendar,
  MapPin,
  Phone,
  Clock,
  Download,
  Trash2,
  X,
  MessageCircle,
} from "lucide-react";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import toast from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { api } from "../../../lib/api"; // ✅ FIX

const PER_PAGE = 10;

export default function BookingsAdmin() {
  const [list, setList] = useState([]);
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState(null);
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
    if (!query) return list;
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

  /* ================= EXPORT EXCEL ================= */
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

  /* ================= STATUS UPDATE ================= */
  const changeStatus = async (id, status) => {
    try {
      await api.patch(`/booking/status/${id}`, { status });
      toast.success(`Status updated → ${status}`);
      load();
    } catch {
      toast.error("Failed to update status");
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
    <div className="p-6 text-white">
      {/* HEADER */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-[#ff6b00]">User Bookings</h2>

        <button
          onClick={exportExcel}
          className="flex items-center gap-2 bg-[#ff6b00] text-black px-4 py-2 rounded font-semibold"
        >
          <Download size={16} /> Export Excel
        </button>
      </div>

      {/* TABLE */}
      <div className="bg-[#121212] border border-[#1f1f1f] rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-[#181818] text-xs uppercase">
            <tr>
              <th className="px-5 py-3">Phone</th>
              <th>Date</th>
              <th>Time</th>
              <th>City</th>
              <th>Status</th>
              <th className="text-center">Actions</th>
            </tr>
          </thead>

          <tbody>
            {paginated.length ? (
              paginated.map((b) => (
                <tr
                  key={b._id}
                  onClick={() => setSelected(b)}
                  className="border-t border-[#1e1e1e] hover:bg-[#1b1b1b] cursor-pointer"
                >
                  <td className="px-5 py-3">{cleanPhone(b.phone)}</td>
                  <td>{b.date}</td>
                  <td>{b.time}</td>
                  <td>{b.city}</td>
                  <td>
                    <span className="px-2 py-1 rounded text-xs bg-[#222]">
                      {b.status}
                    </span>
                  </td>

                  <td
                    className="text-center"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div className="flex gap-2 justify-center">
                      <button onClick={() => changeStatus(b._id, "confirmed")} className="bg-blue-600 px-2 py-1 rounded text-xs">Confirm</button>
                      <button onClick={() => changeStatus(b._id, "completed")} className="bg-green-600 px-2 py-1 rounded text-xs">Done</button>
                      <button onClick={() => changeStatus(b._id, "cancelled")} className="bg-red-600 px-2 py-1 rounded text-xs">Cancel</button>
                      <button onClick={() => sendWhatsapp(b.phone, b.date, b.time)} className="bg-green-700 px-2 py-1 rounded text-xs">
                        <MessageCircle size={12} />
                      </button>
                      <button onClick={() => setDeleteId(b._id)} className="bg-red-700 px-2 py-1 rounded text-xs">
                        <Trash2 size={12} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="6" className="py-10 text-center text-gray-500">
                  No bookings found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <Pagination page={page} total={filtered.length} limit={PER_PAGE} onChange={setPage} />

      {/* DELETE MODAL */}
      <AnimatePresence>
        {deleteId && (
          <motion.div className="fixed inset-0 bg-black/60 flex items-center justify-center">
            <div className="bg-[#1b1b1b] p-6 rounded w-80 text-center">
              <p className="mb-4">Delete booking?</p>
              <div className="flex gap-3 justify-center">
                <button onClick={() => setDeleteId(null)}>Cancel</button>
                <button onClick={deleteBooking} className="bg-red-600 px-4 py-2 rounded">
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
