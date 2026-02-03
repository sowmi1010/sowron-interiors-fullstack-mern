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

  const { query = "" } = useSearch();
  const navigate = useNavigate();

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

  /* ================= ESC TO CLOSE ================= */
  useEffect(() => {
    const esc = (e) => e.key === "Escape" && setDrawer(null);
    window.addEventListener("keydown", esc);
    return () => window.removeEventListener("keydown", esc);
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

  /* ================= NOTE ================= */
  const addNote = async () => {
    if (!note.trim()) return toast.error("Enter a note");

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
      toast.success("Estimate deleted");
      setDeleteId(null);
      load();
    } catch {
      toast.error("Delete failed");
    }
  };

  return (
    <div className="p-6 text-white max-w-[1400px] mx-auto">

      {/* HEADER */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-3xl font-semibold text-brand-red">
            Estimate Requests
          </h2>
          <p className="text-sm text-gray-400">
            {query
              ? `Filtered results for “${query}”`
              : "Customer enquiries & quotations"}
          </p>
        </div>

        <button
          onClick={downloadExcel}
          className="flex items-center gap-2
                     bg-brand-yellow text-black
                     px-4 py-2 rounded-lg font-semibold"
        >
          <FileSpreadsheet size={16} /> Export Excel
        </button>
      </div>

      {/* TABLE */}
      <div className="bg-black/60 backdrop-blur-xl
                      border border-white/10
                      rounded-2xl overflow-hidden">

        <table className="w-full text-sm">
          <thead className="bg-black/40 text-xs uppercase text-gray-400">
            <tr>
              <th className="p-4 text-left">Client</th>
              <th>Phone</th>
              <th>City</th>
              <th>Home</th>
              <th>Budget</th>
              <th>Status</th>
              <th />
            </tr>
          </thead>

          <tbody>
            {paginated.length === 0 ? (
              <tr>
                <td colSpan="7" className="py-16 text-center text-gray-500">
                  No estimate requests found
                </td>
              </tr>
            ) : (
              paginated.map((e) => (
                <tr
                  key={e._id}
                  onClick={() => setDrawer(e)}
                  className="border-t border-white/5
                             hover:bg-white/5 cursor-pointer"
                >
                  <td className="p-4 flex gap-2">
                    <User size={14} /> {e.name}
                  </td>
                  <td>{e.phone}</td>
                  <td>{e.city}</td>
                  <td>{e.homeType}</td>
                  <td className="text-brand-yellow font-semibold">
                    {e.budget}
                  </td>
                  <td>
                    <span className="text-xs px-2 py-1 rounded-full
                                     bg-white/10">
                      {e.status}
                    </span>
                  </td>
                  <td>
                    <button
                      onClick={(ev) => {
                        ev.stopPropagation();
                        setDeleteId(e._id);
                      }}
                      className="text-red-400 hover:text-red-500"
                    >
                      <Trash2 size={14} />
                    </button>
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

      {/* DRAWER */}
      <AnimatePresence>
        {drawer && (
          <>
            {/* BACKDROP */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setDrawer(null)}
              className="fixed inset-0 bg-black/60 z-40"
            />

            {/* PANEL */}
            <motion.div
              initial={{ x: 420 }}
              animate={{ x: 0 }}
              exit={{ x: 420 }}
              transition={{ type: "spring", stiffness: 260, damping: 30 }}
              className="fixed top-0 right-0 w-[420px] h-full
                         bg-black/90 backdrop-blur-xl
                         border-l border-white/10
                         p-6 z-50"
            >
              <div className="flex justify-between mb-4">
                <h3 className="text-xl text-brand-red font-semibold">
                  Conversation
                </h3>

                <button
                  onClick={() => setDrawer(null)}
                  className="w-8 h-8 rounded-full
                             bg-white/10 hover:bg-white/20
                             flex items-center justify-center"
                >
                  <X size={16} />
                </button>
              </div>

              <div className="space-y-2 text-sm text-gray-300">
                <p className="flex gap-2"><User size={14} /> {drawer.name}</p>
                <p className="flex gap-2"><Phone size={14} /> {drawer.phone}</p>
                <p className="flex gap-2"><MapPin size={14} /> {drawer.city}</p>
              </div>

              <div className="mt-5 space-y-3 max-h-60 overflow-y-auto">
                {(drawer.notes || []).map((n, i) => (
                  <div key={i} className="bg-white/5 p-3 rounded-lg text-xs">
                    <p className="text-brand-yellow font-semibold">
                      {n.by} • {n.status}
                    </p>
                    <p className="mt-1">{n.message}</p>
                    <span className="text-gray-500 block mt-1">
                      {new Date(n.createdAt).toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>

              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="mt-4 w-full bg-black p-2 rounded-lg"
              >
                <option value="contacted">Contacted</option>
                <option value="quoted">Quoted</option>
                <option value="followup">Follow-up</option>
                <option value="closed">Closed</option>
              </select>

              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Add discussion note…"
                className="mt-3 w-full p-3 bg-white/5 rounded-lg resize-none"
              />

              <button
                onClick={addNote}
                className="mt-4 w-full bg-brand-red
                           py-2 rounded-lg font-semibold
                           flex gap-2 justify-center"
              >
                <Send size={14} /> Save Note
              </button>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* DELETE MODAL */}
      <AnimatePresence>
        {deleteId && (
          <motion.div
            className="fixed inset-0 bg-black/60
                       flex items-center justify-center z-50"
          >
            <div className="bg-black/80 border border-white/10
                            p-6 rounded-xl w-80 text-center">
              <p className="mb-4">Delete this estimate permanently?</p>
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
