import { useState, useEffect } from "react";
import abstractBg from "/Abstract.jpg";

export default function InsertKeyPeople() {
  const [form, setForm] = useState({
    nome: "",
    cognome: "",
    id_cliente: "",
    ruolo: "",
    linkedin: "",
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

  function capitalize(str) {
    return str
      .trim()
      .toLowerCase()
      .replace(/\b\w/g, l => l.toUpperCase());
  }

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  function handleSubmit(e) {
    e.preventDefault();
    if (
      !form.nome.trim() ||
      !form.cognome.trim() ||
      !form.id_cliente ||
      !form.ruolo.trim()
    ) {
      setMessage("Compila tutti i campi obbligatori: Nome, Cognome, Compagnia e Ruolo.");
      return;
    }
    const data = {
      ...form,
      nome: capitalize(form.nome),
      cognome: capitalize(form.cognome),
      id_cliente: Number(form.id_cliente), // <-- ensure it's a number!
    };
    console.log("Sending:", data);
    fetch(`${import.meta.env.VITE_API_URL}/key-people`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + localStorage.getItem("token"),
      },
      body: JSON.stringify(data),
    })
      .then(res => res.json())
      .then(data => {
        if (data.id) {
          setMessage("Key person inserita!");
          setForm({
            nome: "",
            cognome: "",
            id_cliente: "",
            ruolo: "",
            linkedin: "",
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
        <h1 className="text-2xl font-bold mb-4 text-gray-900">Inserisci Key Person</h1>
        {message && <div className="mb-2 text-center text-blue-700">{message}</div>}
        <input
          name="nome"
          value={form.nome}
          onChange={handleChange}
          placeholder="Nome"
          className="border border-gray-300 rounded-lg px-4 py-2"
          required
        />
        <input
          name="cognome"
          value={form.cognome}
          onChange={handleChange}
          placeholder="Cognome"
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
          name="ruolo"
          value={form.ruolo}
          onChange={handleChange}
          placeholder="Ruolo"
          className="border border-gray-300 rounded-lg px-4 py-2"
        />
        <input
          name="linkedin"
          value={form.linkedin}
          onChange={handleChange}
          placeholder="LinkedIn (URL)"
          className="border border-gray-300 rounded-lg px-4 py-2"
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