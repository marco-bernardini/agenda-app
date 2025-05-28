import { useState, useEffect } from "react";
import abstractBg from "/Abstract.jpg";

export default function InsertInitiative() {
  const [form, setForm] = useState({
    denominazione: "",
    id_cliente: "",
    status: "",
    struttura: "",
    note: "",
  });
  const [companies, setCompanies] = useState([]);
  const [message, setMessage] = useState("");

  useEffect(() => {
    fetch(`${import.meta.env.VITE_API_URL}/clienti`, {
      headers: { Authorization: "Bearer " + localStorage.getItem("token") },
    })
      .then(res => res.json())
      .then(setCompanies);
  }, []);

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  function handleSubmit(e) {
    e.preventDefault();
    if (
      !form.denominazione.trim() ||
      !form.id_cliente ||
      !form.status.trim() ||
      !form.struttura.trim()
    ) {
      setMessage("Compila tutti i campi obbligatori: Denominazione, Compagnia, Status, Struttura.");
      return;
    }
    fetch(`${import.meta.env.VITE_API_URL}/trattative`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + localStorage.getItem("token"),
      },
      body: JSON.stringify(form),
    })
      .then(res => res.json())
      .then(data => {
        if (data.id) {
          setMessage("Trattativa inserita!");
          setForm({
            denominazione: "",
            id_cliente: "",
            status: "",
            struttura: "",
            note: "",
          });
        } else {
          setMessage(data.error || "Errore");
        }
      });
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundImage: `url(${abstractBg})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        display: "flex",
        alignItems: "flex-start",
        justifyContent: "center",
        paddingTop: "120px",
      }}
    >
      <form
        onSubmit={handleSubmit}
        className="bg-white shadow-xl rounded-xl p-8 w-full max-w-md flex flex-col gap-4"
      >
        <h1 className="text-2xl font-bold mb-4 text-gray-900">Inserisci Trattativa</h1>
        {message && <div className="mb-2 text-center text-blue-700">{message}</div>}
        <input
          name="denominazione"
          value={form.denominazione}
          onChange={handleChange}
          placeholder="Denominazione"
          className="border border-gray-300 rounded-lg px-4 py-2"
          required
        />
        <select
          name="id_cliente"
          value={form.id_cliente}
          onChange={handleChange}
          className="border border-gray-300 rounded-lg px-4 py-2"
          required
        >
          <option value="">Seleziona compagnia</option>
          {companies.map(c => (
            <option key={c.id} value={c.id}>
              {c.denominazione_cliente}
            </option>
          ))}
        </select>
        <input
          name="status"
          value={form.status}
          onChange={handleChange}
          placeholder="Status"
          className="border border-gray-300 rounded-lg px-4 py-2"
          required
        />
        <input
          name="struttura"
          value={form.struttura}
          onChange={handleChange}
          placeholder="Struttura"
          className="border border-gray-300 rounded-lg px-4 py-2"
          required
        />
        <textarea
          name="note"
          value={form.note}
          onChange={handleChange}
          placeholder="Note"
          className="border border-gray-300 rounded-lg px-4 py-2"
          rows={3}
        />
        <button
          type="submit"
          className="cursor-pointer relative inline-flex items-center justify-center p-0.5 overflow-hidden text-base font-bold rounded-lg bg-gradient-to-br from-[#2A66DD] to-[#1DC8DF] text-white"
        >
          <span className="relative w-full px-6 py-2.5 bg-transparent rounded-md text-white font-bold">
            Salva
          </span>
        </button>
      </form>
    </div>
  );
}