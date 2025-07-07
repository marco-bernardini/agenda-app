import { useState } from "react";
import abstractBg from "/Abstract.jpg";

export default function InsertCompany() {
  const [form, setForm] = useState({
    denominazione_cliente: "",
    settore: "",
    gruppo: "",
    ramo: "",
    capitale_sociale: "",
    fatturato: "", // <-- add this
    sede: "",
    sito_web: "",
  });
  const [error, setError] = useState("");

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError(""); // clear error on change
  }

  function addCompany(e) {
    e.preventDefault();
    const data = {
      ...form,
      capitale_sociale:
        form.capitale_sociale === "" ? null : Number(form.capitale_sociale),
      fatturato: form.fatturato === "" ? null : Number(form.fatturato),
    };
    fetch(`${import.meta.env.VITE_API_URL}/clienti`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + localStorage.getItem("token"),
      },
      body: JSON.stringify(data),
    })
      .then(async (res) => {
        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.error || "Errore");
        }
        return res.json();
      })
      .then(() => {
        alert("Company added!");
        setForm({
          denominazione_cliente: "",
          settore: "",
          gruppo: "",
          ramo: "",
          capitale_sociale: "",
          fatturato: "",
          sede: "",
          sito_web: "",
        });
      })
      .catch((err) => setError(err.message));
  }

  // Disable ramo if settore is Banking
  const ramoDisabled = form.settore != "Insurance";

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
        paddingTop: "120px", // Add space for navbar
      }}
    >
      <form
        onSubmit={addCompany}
        className="max-w-4xl w-full mx-auto bg-white border border-gray-200 rounded-xl shadow-md p-8"
      >
        <h1 className="text-2xl font-bold mb-8 text-gray-900">
          Inserisci Compagnia
        </h1>
        {error && (
          <div className="mb-4 text-red-600 bg-red-50 border border-red-200 rounded p-2">
            {error}
          </div>
        )}
        <div className="grid gap-6 mb-6 md:grid-cols-2">
          <div>
            <label
              htmlFor="denominazione_cliente"
              className="block mb-2 text-sm font-medium text-gray-900"
            >
              Denominazione Cliente
            </label>
            <input
              type="text"
              id="denominazione_cliente"
              name="denominazione_cliente"
              value={form.denominazione_cliente}
              onChange={handleChange}
              className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-indigo-500 focus:border-indigo-500 block w-full p-2.5"
              required
            />
          </div>
          <div>
            <label
              htmlFor="settore"
              className="block mb-2 text-sm font-medium text-gray-900"
            >
              Settore
            </label>
            <select
              id="settore"
              name="settore"
              value={form.settore}
              onChange={handleChange}
              className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-indigo-500 focus:border-indigo-500 block w-full p-2.5"
              required
            >
              <option value="">Seleziona settore</option>
              <option value="Banking">Banking</option>
              <option value="Insurance">Insurance</option>
              <option value="Payments">Payments</option>
              <option value="Asset Management">Asset Management</option>
              <option value="IT Services">IT Services</option>
            </select>
          </div>
          <div>
            <label
              htmlFor="gruppo"
              className="block mb-2 text-sm font-medium text-gray-900"
            >
              Gruppo
            </label>
            <input
              type="text"
              id="gruppo"
              name="gruppo"
              value={form.gruppo}
              onChange={handleChange}
              className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-indigo-500 focus:border-indigo-500 block w-full p-2.5"
            />
          </div>
          <div>
            <label
              htmlFor="ramo"
              className="block mb-2 text-sm font-medium text-gray-900"
            >
              Ramo
            </label>
            <select
              id="ramo"
              name="ramo"
              value={form.ramo}
              onChange={handleChange}
              className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-indigo-500 focus:border-indigo-500 block w-full p-2.5"
              disabled={ramoDisabled}
              required={!ramoDisabled}
            >
              <option value="">Seleziona ramo</option>
              <option value="V">V</option>
              <option value="D">D</option>
              <option value="M">M</option>
            </select>
          </div>
          <div>
            <label
              htmlFor="capitale_sociale"
              className="block mb-2 text-sm font-medium text-gray-900"
            >
              Capitale Sociale (€)
            </label>
            <input
              type="number"
              id="capitale_sociale"
              name="capitale_sociale"
              value={form.capitale_sociale}
              onChange={handleChange}
              className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-indigo-500 focus:border-indigo-500 block w-full p-2.5"
              min="0"
            />
          </div>
          <div>
            <label
              htmlFor="fatturato"
              className="block mb-2 text-sm font-medium text-gray-900"
            >
              Fatturato (€)
            </label>
            <input
              type="number"
              id="fatturato"
              name="fatturato"
              value={form.fatturato}
              onChange={handleChange}
              className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-indigo-500 focus:border-indigo-500 block w-full p-2.5"
              min="0"
            />
          </div>
          <div>
            <label
              htmlFor="sede"
              className="block mb-2 text-sm font-medium text-gray-900"
            >
              Sede
            </label>
            <input
              type="text"
              id="sede"
              name="sede"
              value={form.sede}
              onChange={handleChange}
              className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-indigo-500 focus:border-indigo-500 block w-full p-2.5"
            />
          </div>
          <div className="md:col-span-2">
            <label
              htmlFor="sito_web"
              className="block mb-2 text-sm font-medium text-gray-900"
            >
              Sito Web
            </label>
            <input
              type="url"
              id="sito_web"
              name="sito_web"
              value={form.sito_web}
              onChange={handleChange}
              className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-indigo-500 focus:border-indigo-500 block w-full p-2.5"
            />
          </div>
        </div>
        <div className="flex items-center justify-end gap-x-4">
          <button
            type="button"
            className="cursor-pointer relative inline-flex items-center justify-center p-0.5 overflow-hidden text-base font-bold rounded-lg bg-red-600 focus:ring-4 focus:outline-none focus:ring-red-200 w-[120px]"
            onClick={() => {
              setForm({
                denominazione_cliente: "",
                settore: "",
                gruppo: "",
                ramo: "",
                capitale_sociale: "",
                fatturato: "", // <-- add this
                sede: "",
                sito_web: "",
              });
              setError("");
            }}
          >
            <span className="relative w-full px-6 py-2.5 bg-transparent rounded-md text-white font-bold">
              Annulla
            </span>
          </button>
          <button
            type="submit"
            className="cursor-pointer relative inline-flex items-center justify-center p-0.5 overflow-hidden text-base font-bold rounded-lg bg-gradient-to-br from-[#2A66DD] to-[#1DC8DF] hover:bg-gradient-to-br hover:from-[#1DC8DF] hover:to-[#2A66DD] focus:ring-4 focus:outline-none focus:ring-blue-100 w-[120px]"
          >
            <span className="relative w-full px-6 py-2.5 bg-transparent rounded-md text-white font-bold">
              Salva
            </span>
          </button>
        </div>
      </form>
    </div>
  );
}
