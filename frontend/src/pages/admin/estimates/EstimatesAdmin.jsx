import { useEffect, useMemo, useState } from "react";
import Pagination from "../../../components/ui/Pagination.jsx";
import { useSearch } from "../../../context/SearchContext";
import {
  MapPin,
  Phone,
  User,
  Trash2,
  Send,
  X,
  FileSpreadsheet,
} from "lucide-react";
import * as XLSX from "xlsx";
import toast from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { api } from "../../../lib/api";

const PER_PAGE = 10;

export default function EstimatesAdmin() {
  const [list, setList] = useState([]);
  const [page, setPage] = useState(1);
  const [drawer, setDrawer] = useState(null);
  const [note, setNote] = useState("");
  const [status, setStatus] = useState("contacted");
  const [deleteId, setDeleteId] = useState(null);

  const { query } = useSearch();
  const navigate = useNavigate();

  /* ================= AUTH GUARD ================= */
  useEffect(() => {
    const token = localStorage.getItem("adminToken");
    if (!token) navigate("/admin/login");
  }, []);

  /* ================= LOAD ================= */
  const load = async () => {
    try {
      const res = await api.get("/estimate");
      setList(res.data || []);
    } catch {
      toast.error("Session expired");
      navigate("/admin/login");
    }
  };

  useEffect(() => {
    load();
  }, []);

  /* ================= SEARCH ================= */
  const filtered = useMemo(() => {
    const q = query.toLowerCase();
    return list.filter((e) =>
      `${e.name} ${e.phone} ${e.city} ${e.homeType} ${e.budget}`
        .toLowerCase()
        .includes(q)
    );
  }, [list, query]);

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
      Home: e.homeType,
      Budget: e.budget,
      Status: e.status,
    }));
    const ws = XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Estimates");
    XLSX.writeFile(wb, `Estimates_${Date.now()}.xlsx`);
  };

  /* ================= ADD NOTE ================= */
  const addNote = async () => {
    if (!note.trim()) return toast.error("Enter message");

    try {
      await api.patch(`/estimate/${drawer._id}/note`, {
        message: note,
        status,
      });

      toast.success("Note saved");
      setNote("");
      load();
    } catch {
      toast.error("Failed to save note");
    }
  };

  /* ================= DELETE ================= */
  const deleteEstimate = async () => {
    try {
      await api.delete(`/estimate/${deleteId}`);
      toast.success("Deleted");
      setDeleteId(null);
      load();
    } catch {
      toast.error("Delete failed");
    }
  };

  /* ================= UI ================= */
  return (
    <div className="p-6 text-white">
      {/* HEADER */}
      <div className="flex justify-between mb-6">
        <h2 className="text-2xl font-bold text-[#ff6b00]">
          Estimate Requests
        </h2>
        <button
          onClick={downloadExcel}
          className="bg-[#ff6b00] text-black px-3 py-1 rounded flex gap-2"
        >
          <FileSpreadsheet size={14} /> Excel
        </button>
      </div>

      {/* TABLE */}
      <div className="bg-[#121212] rounded-xl border border-[#1f1f1f]">
        <table className="w-full text-sm">
          <thead className="bg-[#181818] text-xs uppercase">
            <tr>
              <th className="p-3">Name</th>
              <th>Phone</th>
              <th>City</th>
              <th>Home</th>
              <th>Budget</th>
              <th>Status</th>
              <th />
            </tr>
          </thead>

          <tbody>
            {paginated.map((e) => (
              <tr
                key={e._id}
                onClick={() => setDrawer(e)}
                className="border-t border-[#1e1e1e] hover:bg-[#1b1b1b] cursor-pointer"
              >
                <td className="p-3 flex gap-2">
                  <User size={14} /> {e.name}
                </td>
                <td>{e.phone}</td>
                <td>{e.city}</td>
                <td>{e.homeType}</td>
                <td className="text-[#ff6b00]">{e.budget}</td>
                <td>
                  <span className="text-xs bg-[#222] px-2 py-1 rounded">
                    {e.status}
                  </span>
                </td>
                <td>
                  <button
                    onClick={(ev) => {
                      ev.stopPropagation();
                      setDeleteId(e._id);
                    }}
                    className="bg-red-600 px-2 py-1 rounded"
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
        {drawer && (
          <motion.div
            initial={{ x: 350 }}
            animate={{ x: 0 }}
            exit={{ x: 350 }}
            className="fixed top-0 right-0 w-96 h-full bg-[#0f0f0f] p-6 z-50"
          >
            <div className="flex justify-between mb-4">
              <h3 className="text-lg text-[#ff6b00]">Conversation</h3>
              <X onClick={() => setDrawer(null)} />
            </div>

            <div className="text-sm space-y-2">
              <p><User size={14} /> {drawer.name}</p>
              <p><Phone size={14} /> {drawer.phone}</p>
              <p><MapPin size={14} /> {drawer.city}</p>
            </div>

            <div className="mt-4 space-y-3 max-h-64 overflow-y-auto">
              {(drawer.notes || []).map((n, i) => (
                <div key={i} className="bg-[#1a1a1a] p-2 rounded text-xs">
                  <p className="text-[#ff6b00]">{n.by} • {n.status}</p>
                  <p>{n.message}</p>
                  <span className="text-gray-500">
                    {new Date(n.createdAt).toLocaleString()}
                  </span>
                </div>
              ))}
            </div>

            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="mt-4 w-full bg-[#1a1a1a] p-2 rounded"
            >
              <option value="contacted">Contacted</option>
              <option value="quoted">Quoted</option>
              <option value="followup">Follow-up</option>
              <option value="closed">Closed</option>
            </select>

            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="What did you discuss?"
              className="mt-2 w-full p-2 bg-[#1a1a1a] rounded"
            />

            <button
              onClick={addNote}
              className="mt-3 w-full bg-[#ff6b00] text-black py-2 rounded flex gap-2 justify-center"
            >
              <Send size={14} /> Save Note
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* DELETE MODAL */}
      <AnimatePresence>
        {deleteId && (
          <motion.div className="fixed inset-0 bg-black/60 flex items-center justify-center">
            <div className="bg-[#1b1b1b] p-6 rounded w-80">
              <p className="mb-4">Delete estimate?</p>
              <div className="flex justify-between">
                <button onClick={() => setDeleteId(null)}>Cancel</button>
                <button
                  onClick={deleteEstimate}
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
