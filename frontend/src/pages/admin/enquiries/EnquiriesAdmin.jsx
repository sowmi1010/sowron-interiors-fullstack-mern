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

  const { query } = useSearch();
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
      toast.success("Deleted ✓");
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

      toast.success("Reply saved ✓");
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

  /* ================= UI ================= */
  return (
    <div className="p-6 text-white">
      {/* HEADER */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-[#ff6b00]">
          Customer Enquiries
        </h2>

        <div className="flex gap-3">
          <span className="text-xs bg-[#171717] px-3 py-1 rounded">
            Total: {filtered.length}
          </span>
          <button
            onClick={downloadExcel}
            className="flex items-center gap-2 bg-[#ff6b00] text-black px-4 py-2 rounded"
          >
            <FileSpreadsheet size={14} /> Excel
          </button>
        </div>
      </div>

      {/* TABLE */}
      <div className="bg-[#121212] rounded-xl border border-[#1f1f1f] overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-[#181818] text-xs uppercase">
            <tr>
              <th className="px-5 py-3 text-left">Name</th>
              <th className="px-5 py-3 text-left">Phone</th>
              <th className="px-5 py-3 text-left">City</th>
              <th className="px-5 py-3 text-left">Message</th>
              <th className="px-5 py-3 text-center">Status</th>
              <th className="px-5 py-3 text-center">Action</th>
            </tr>
          </thead>

          <tbody>
            {paginated.map((e) => (
              <tr
                key={e._id}
                onClick={() => setSelected(e)}
                className="border-t border-[#1e1e1e] hover:bg-[#1b1b1b] cursor-pointer"
              >
                <td className="px-5 py-3">{e.name}</td>
                <td className="px-5 py-3">{e.phone}</td>
                <td className="px-5 py-3">{e.city}</td>
                <td className="px-5 py-3 truncate max-w-[200px]">
                  {e.message}
                </td>
                <td className="px-5 py-3 text-center">
                  <span
                    className={`px-2 py-1 rounded text-xs ${
                      e.status === "replied"
                        ? "bg-green-600"
                        : "bg-yellow-500 text-black"
                    }`}
                  >
                    {e.status}
                  </span>
                </td>
                <td
                  className="px-5 py-3 text-center"
                  onClick={(ev) => ev.stopPropagation()}
                >
                  <button
                    onClick={() => setDeleteId(e._id)}
                    className="bg-red-600 px-3 py-1 rounded"
                  >
                    <Trash2 size={14} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Pagination
        page={page}
        total={filtered.length}
        perPage={PER_PAGE}
        onChange={setPage}
      />

      {/* DRAWER */}
      <AnimatePresence>
        {selected && (
          <motion.div
            initial={{ x: 350 }}
            animate={{ x: 0 }}
            exit={{ x: 350 }}
            className="fixed top-0 right-0 w-80 h-full bg-[#0f0f0f] p-6 z-50"
          >
            <div className="flex justify-between mb-4">
              <h3 className="text-lg text-[#ff6b00]">Enquiry</h3>
              <X onClick={() => setSelected(null)} />
            </div>

            <div className="space-y-3 text-sm">
              <p><User2 size={14} className="inline" /> {selected.name}</p>
              <p><Phone size={14} className="inline" /> {selected.phone}</p>
              <p><MapPin size={14} className="inline" /> {selected.city}</p>
              <p className="flex gap-2"><MessageSquare size={14} /> {selected.message}</p>

              {selected.repliedAt && (
                <p className="text-xs text-gray-400 flex gap-1">
                  <Clock4 size={12} />
                  {new Date(selected.repliedAt).toLocaleString()}
                </p>
              )}
            </div>

            <textarea
              className="mt-4 w-full bg-[#1a1a1a] p-2 rounded"
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
              onClick={() => sendWhatsapp(selected.phone, selected.message)}
              className="mt-4 w-full bg-green-700 py-2 rounded flex gap-2 justify-center"
            >
              <Send size={14} /> WhatsApp
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* DELETE MODAL */}
      <AnimatePresence>
        {deleteId && (
          <motion.div className="fixed inset-0 bg-black/60 flex items-center justify-center">
            <div className="bg-[#1b1b1b] p-6 rounded w-80 text-center">
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
