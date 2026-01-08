import { useEffect, useMemo, useState } from "react";
import { api } from "../../../lib/api";
import Pagination from "../../../components/ui/Pagination.jsx";
import { useSearch } from "../../../context/SearchContext";
import {
  Phone,
  User2,
  MapPin,
  MessageSquare,
  Trash2,
  FileSpreadsheet,
  X,
  Send,
  Clock4,
} from "lucide-react";
import * as XLSX from "xlsx";
import toast from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";

const PER_PAGE = 10;

export default function EnquiriesAdmin() {
  const [data, setData] = useState([]);
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState(null);
  const [deleteId, setDeleteId] = useState(null);

  const { query = "" } = useSearch();
  const navigate = useNavigate();

  /* ================= LOAD ================= */
  const load = async () => {
    try {
      const res = await api.get("/enquiry");
      setData(res.data || []);
    } catch {
      toast.error("Session expired – Login again");
      navigate("/admin/login");
    }
  };

  useEffect(() => {
    load();
  }, []);

  /* ================= ESC TO CLOSE ================= */
  useEffect(() => {
    const esc = (e) => e.key === "Escape" && setSelected(null);
    window.addEventListener("keydown", esc);
    return () => window.removeEventListener("keydown", esc);
  }, []);

  /* ================= SEARCH ================= */
  const filtered = useMemo(() => {
    const q = query.toLowerCase();
    return data.filter(
      (e) =>
        e.name?.toLowerCase().includes(q) ||
        e.phone?.toLowerCase().includes(q) ||
        e.city?.toLowerCase().includes(q)
    );
  }, [data, query]);

  useEffect(() => setPage(1), [query]);

  const paginated = filtered.slice(
    (page - 1) * PER_PAGE,
    page * PER_PAGE
  );

  /* ================= EXCEL ================= */
  const downloadExcel = () => {
    const rows = filtered.map((e, i) => ({
      S_No: i + 1,
      Name: e.name,
      Phone: e.phone,
      City: e.city,
      Message: e.message,
      Status: e.status,
      RepliedAt: e.repliedAt
        ? new Date(e.repliedAt).toLocaleString()
        : "Not replied",
    }));

    const ws = XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Enquiries");
    XLSX.writeFile(wb, `Enquiries_${Date.now()}.xlsx`);
  };

  /* ================= DELETE ================= */
  const deleteItem = async () => {
    try {
      await api.delete(`/enquiry/${deleteId}`);
      toast.success("Enquiry deleted");
      setDeleteId(null);
      load();
    } catch {
      toast.error("Delete failed");
    }
  };

  /* ================= SAVE REPLY ================= */
  const saveReply = async (status) => {
    if (!selected.replyMessage?.trim()) {
      return toast.error("Reply message required");
    }

    try {
      await api.patch(`/enquiry/update/${selected._id}`, {
        status,
        replyMessage: selected.replyMessage,
      });

      toast.success("Reply saved");
      setSelected(null);
      load();
    } catch {
      toast.error("Update failed");
    }
  };

  /* ================= WHATSAPP ================= */
  const sendWhatsapp = (phone, msg) => {
    const clean = phone.replace(/\D/g, "");
    const text = `Hello 👋

Regarding your enquiry:
"${msg}"

Thank you – Sowron Interiors 😊`;

    window.open(
      `https://wa.me/91${clean}?text=${encodeURIComponent(text)}`,
      "_blank"
    );
  };

  return (
    <div className="p-6 text-white">

      {/* HEADER */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-3xl font-semibold text-brand-red">
            Customer Enquiries
          </h2>
          <p className="text-sm text-gray-400">
            Manage & respond to customer messages
          </p>
        </div>

        <div className="flex gap-3">
          <span className="text-xs bg-black/40 border border-white/10
                           px-3 py-1 rounded-full">
            Total: {filtered.length}
          </span>

          <button
            onClick={downloadExcel}
            className="flex items-center gap-2
                       bg-brand-red text-white px-4 py-2
                       rounded-lg font-semibold hover:bg-brand-redDark"
          >
            <FileSpreadsheet size={14} /> Export
          </button>
        </div>
      </div>

      {/* TABLE */}
      <div className="bg-black/60 backdrop-blur-xl
                      border border-white/10
                      rounded-2xl overflow-hidden shadow-glass">

        <table className="w-full text-sm">
          <thead className="bg-white/5 text-xs uppercase text-gray-300">
            <tr>
              <th className="px-5 py-4 text-left">Customer</th>
              <th className="px-5 py-4 text-left">City</th>
              <th className="px-5 py-4 text-left">Message</th>
              <th className="px-5 py-4 text-center">Status</th>
              <th className="px-5 py-4 text-center">Action</th>
            </tr>
          </thead>

          <tbody>
            {paginated.map((e) => (
              <tr
                key={e._id}
                onClick={() => setSelected(e)}
                className="border-t border-white/5
                           hover:bg-white/5 transition cursor-pointer"
              >
                <td className="px-5 py-4">
                  <div className="flex flex-col">
                    <span className="font-medium flex gap-2 items-center">
                      <User2 size={14} /> {e.name}
                    </span>
                    <span className="text-xs text-gray-400 flex gap-1">
                      <Phone size={12} /> {e.phone}
                    </span>
                  </div>
                </td>

                <td className="px-5 py-4 text-gray-300 flex gap-1 items-center">
                  <MapPin size={14} /> {e.city}
                </td>

                <td className="px-5 py-4 truncate max-w-[220px] text-gray-300">
                  {e.message}
                </td>

                <td className="px-5 py-4 text-center">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-medium
                      ${
                        e.status === "replied"
                          ? "bg-green-500/20 text-green-400"
                          : "bg-yellow-400/20 text-yellow-300"
                      }`}
                  >
                    {e.status}
                  </span>
                </td>

                <td
                  className="px-5 py-4 text-center"
                  onClick={(ev) => ev.stopPropagation()}
                >
                  <button
                    onClick={() => setDeleteId(e._id)}
                    className="text-red-500 hover:underline"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}

            {!paginated.length && (
              <tr>
                <td colSpan="5" className="py-16 text-center text-gray-500">
                  No enquiries found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* PAGINATION */}
      <Pagination
        page={page}
        total={filtered.length}
        limit={PER_PAGE}
        onChange={setPage}
      />

      {/* DRAWER */}
      <AnimatePresence>
        {selected && (
          <>
            {/* BACKDROP */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelected(null)}
              className="fixed inset-0 bg-black/60 z-40"
            />

            {/* PANEL */}
            <motion.div
              initial={{ x: 380 }}
              animate={{ x: 0 }}
              exit={{ x: 380 }}
              transition={{ type: "spring", stiffness: 260, damping: 30 }}
              className="fixed top-0 right-0 w-[360px] h-full
                         bg-black/85 backdrop-blur-xl
                         border-l border-white/10
                         p-6 z-50"
            >
              <div className="flex justify-between mb-4">
                <h3 className="text-lg font-semibold text-brand-red">
                  Enquiry Details
                </h3>

                <button
                  onClick={() => setSelected(null)}
                  className="w-8 h-8 rounded-full
                             bg-white/10 hover:bg-white/20
                             flex items-center justify-center"
                >
                  <X size={16} />
                </button>
              </div>

              <div className="space-y-3 text-sm text-gray-200">
                <p className="flex gap-2"><User2 size={14} /> {selected.name}</p>
                <p className="flex gap-2"><Phone size={14} /> {selected.phone}</p>
                <p className="flex gap-2"><MapPin size={14} /> {selected.city}</p>
                <p className="flex gap-2"><MessageSquare size={14} /> {selected.message}</p>

                {selected.repliedAt && (
                  <p className="text-xs text-gray-400 flex gap-1">
                    <Clock4 size={12} />
                    {new Date(selected.repliedAt).toLocaleString()}
                  </p>
                )}
              </div>

              <textarea
                className="mt-4 w-full bg-white/5 border border-white/10
                           p-2 rounded resize-none"
                placeholder="Reply message..."
                value={selected.replyMessage || ""}
                onChange={(e) =>
                  setSelected({ ...selected, replyMessage: e.target.value })
                }
              />

              <div className="flex gap-2 mt-4">
                <button
                  onClick={() => saveReply("replied")}
                  className="flex-1 bg-green-600 py-2 rounded"
                >
                  Save
                </button>

                <button
                  onClick={() => saveReply("pending")}
                  className="flex-1 bg-yellow-500 text-black py-2 rounded"
                >
                  Pending
                </button>
              </div>

              <button
                onClick={() =>
                  sendWhatsapp(selected.phone, selected.message)
                }
                className="mt-4 w-full bg-green-700 py-2 rounded
                           flex gap-2 justify-center"
              >
                <Send size={14} /> WhatsApp
              </button>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* DELETE MODAL */}
      <AnimatePresence>
        {deleteId && (
          <motion.div className="fixed inset-0 bg-black/60
                                 flex items-center justify-center z-50">
            <div className="bg-[#111] border border-white/10
                            p-6 rounded-xl w-80 text-center">
              <p className="mb-4">Delete this enquiry?</p>
              <div className="flex justify-between">
                <button onClick={() => setDeleteId(null)}>Cancel</button>
                <button
                  onClick={deleteItem}
                  className="bg-red-600 px-4 py-2 rounded"
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
