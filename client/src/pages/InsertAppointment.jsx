import { useState, useEffect } from "react";
import abstractBg from "/Abstract.jpg";
import Select from "react-select";

export default function InsertAppointment() {
  const [form, setForm] = useState({
    cliente: "",
    trattativa: "",
    esito: "to start",
    referente_alten: "",
    referente_azienda: "",
    data: "",
    format: "",
    referente_sdg: [],
    to_do: "",
    next_steps: "",
    note: "",
  });

  const [clienti, setClienti] = useState([]);
  const [trattative, setTrattative] = useState([]);
  const [sdgGroup, setSdgGroup] = useState([]);
  const [keyPeople, setKeyPeople] = useState([]);
  const [altenList, setAltenList] = useState([]);

  useEffect(() => {
    fetch(`${import.meta.env.VITE_API_URL}/clienti`, {
      headers: { Authorization: "Bearer " + localStorage.getItem("token") },
    })
      .then(res => res.json())
      .then(setClienti);

    fetch(`${import.meta.env.VITE_API_URL}/trattative`, {
      headers: { Authorization: "Bearer " + localStorage.getItem("token") },
    })
      .then(res => res.json())
      .then(setTrattative);

    fetch(`${import.meta.env.VITE_API_URL}/sdg-group`, {
      headers: { Authorization: "Bearer " + localStorage.getItem("token") },
    })
      .then(res => res.json())
      .then(setSdgGroup);

    fetch(`${import.meta.env.VITE_API_URL}/key-people`, {
      headers: { Authorization: "Bearer " + localStorage.getItem("token") },
    })
      .then(res => res.json())
      .then(setKeyPeople);

    fetch(`${import.meta.env.VITE_API_URL}/alten`, {
      headers: { Authorization: "Bearer " + localStorage.getItem("token") },
    })
      .then(res => res.json())
      .then(setAltenList);
  }, []);

  function handleChange(e) {
    const { name, value } = e.target;
    setForm(prev => ({
      ...prev,
      [name]: value,
      // Reset trattativa if cliente changes
      ...(name === "cliente" ? { trattativa: "" } : {})
    }));
  }

  async function addAppointment(e) {
    e.preventDefault();

    // 1. Find the selected cliente object
    const selectedCliente = clienti.find(c => c.denominazione_cliente === form.cliente);
    if (!selectedCliente) {
      alert("Seleziona un cliente valido.");
      return;
    }

    // 3. Prepare appointment data
    const appointmentData = {
      esito: form.esito,
      data: form.data,
      format: form.format,
      to_do: form.to_do,
      next_steps: form.next_steps,
      note: form.note,
      id_trattativa: form.trattativa ? Number(form.trattativa) : null,
    };

    // 4. Create the appointment
    const res = await fetch(`${import.meta.env.VITE_API_URL}/appuntamenti`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + localStorage.getItem("token"),
      },
      body: JSON.stringify(appointmentData),
    });

    if (!res.ok) {
      const errorData = await res.json();
      alert("Errore nella creazione dell'appuntamento: " + (errorData.error || "Errore"));
      return; // Stop here if creation failed
    }

    const newAppointment = await res.json();
    const appointmentId = newAppointment.id;

    if (!appointmentId) {
      alert("Errore: appointmentId non valido.");
      return;
    }

    // 5. Link referente azienda (appointment_key_people)
    if (form.referente_azienda) {
      const kp = keyPeople.find(
        p => `${p.nome} ${p.cognome}` === form.referente_azienda && p.id_cliente === selectedCliente.id
      );
      if (kp) {
        console.log("KEY PEOPLE:", {
          id_appuntamento: appointmentId,
          id_person: kp.id
        });
        await fetch(`${import.meta.env.VITE_API_URL}/appuntamenti-key-people`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: "Bearer " + localStorage.getItem("token"),
          },
          body: JSON.stringify({
            id_appuntamento: Number(appointmentId),
            id_person: Number(kp.id),
          }),
        });
      }
    }

    // 6. Link referenti SDG (appuntamenti_sdg_group)
    if (form.referente_sdg && form.referente_sdg.length > 0) {
      for (const sdgId of form.referente_sdg) {
        console.log("SDG GROUP:", {
          id_appuntamento: appointmentId,
          sdg_group_id: sdgId
        });
        await fetch(`${import.meta.env.VITE_API_URL}/appuntamenti-sdg-group`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: "Bearer " + localStorage.getItem("token"),
          },
          body: JSON.stringify({
            id_appuntamento: Number(appointmentId),
            id_sdg: Number(sdgId),
          }),
        });
      }
    }

    // 7. Link referente alten (appuntamenti_alten)
    if (form.referente_alten) {
      const alten = altenList.find(a => a.nominativo === form.referente_alten);
      if (alten) {
        await fetch(`${import.meta.env.VITE_API_URL}/appuntamenti-alten`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: "Bearer " + localStorage.getItem("token"),
          },
          body: JSON.stringify({
            id_appuntamento: Number(appointmentId),
            id_alten: Number(alten.id),
          }),
        });
      }
    }

    alert("Appointment added!");
    setForm({
      cliente: "",
      trattativa: "",
      esito: "to start",
      referente_alten: "",
      referente_azienda: "",
      data: "",
      format: "",
      referente_sdg: [],
      to_do: "",
      next_steps: "",
      note: "",
    });
  }

  const statusColor = {
    "ongoing": "bg-green-100 text-green-800",
    "to start": "bg-blue-100 text-blue-800",
    "closed": "bg-red-100 text-red-800"
  }[form.esito] || "bg-gray-50 text-gray-900";

  const uniqueClienti = Array.from(
    new Set(clienti.map(c => c.denominazione_cliente).filter(Boolean))
  );

  const selectedCompanyObj = clienti.find(c => c.denominazione_cliente === form.cliente);
  const trattativeForCompany = selectedCompanyObj
    ? trattative.filter(t => t.id_cliente === selectedCompanyObj.id)
    : [];

  // Filter key people based on selected company
  const filteredKeyPeople = selectedCompanyObj
    ? keyPeople.filter(person => person.id_cliente === selectedCompanyObj.id)
    : keyPeople;

  const keyPeopleOptions = filteredKeyPeople.map(person => ({
    value: `${person.nome} ${person.cognome}`,
    label: `${person.nome} ${person.cognome}`
  }));

  // Prepare options for react-select for SDG group
  const sdgOptions = sdgGroup.map(person => ({
    value: person.id,
    label: `${person.nominativo} (${person.business_unit})`
  }));

  // Alten options
  const altenOptions = altenList.map(a => ({
    value: a.nominativo,
    label: a.nominativo
  }));

  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundImage: `url(${abstractBg})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        paddingTop: "72px",
      }}
    >
      <form
        onSubmit={addAppointment}
        className="max-w-4xl w-full mx-auto mt-8 pt-12 bg-white border border-gray-200 rounded-xl shadow-md p-8"
      >
        <h1 className="text-2xl font-bold mb-8 text-gray-900">Inserisci Appuntamento</h1>
        <div className="grid gap-6 mb-6 md:grid-cols-2">
          <div>
            <label htmlFor="cliente" className="block mb-2 text-sm font-medium text-gray-900">Cliente</label>
            <select
              id="cliente"
              name="cliente"
              value={form.cliente}
              onChange={handleChange}
              className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-indigo-500 focus:border-indigo-500 block w-full p-2.5"
              required
            >
              <option value="">Seleziona cliente</option>
              {[...uniqueClienti].sort((a, b) => a.localeCompare(b)).map(denominazioneCliente => (
                <option key={denominazioneCliente} value={denominazioneCliente}>
                  {denominazioneCliente}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="esito" className="block mb-2 text-sm font-medium text-gray-900">Esito</label>
            <select
              id="esito"
              name="esito"
              value={form.esito}
              onChange={handleChange}
              className={`border border-gray-300 text-sm rounded-lg focus:ring-indigo-500 focus:border-indigo-500 block w-full p-2.5 ${statusColor}`}
            >
              <option value="da fare">Da Fare</option>
              <option value="attesa feedback">Attesa Feedback</option>
              <option value="ritorno">Ritorno</option>              
              <option value="risentire">Risentire</option>
              <option value="progetto">Progetto</option>
              <option value="negativo">Negativo</option>
            </select>
          </div>
          <div>
            <label htmlFor="referente_alten" className="block mb-2 text-sm font-medium text-gray-900">Referente Alten</label>
            <Select
              id="referente_alten"
              name="referente_alten"
              options={altenOptions}
              value={altenOptions.find(opt => opt.value === form.referente_alten) || null}
              onChange={selected =>
                setForm({
                  ...form,
                  referente_alten: selected ? selected.value : ""
                })
              }
              className="react-select-container"
              classNamePrefix="react-select"
              placeholder="Seleziona referente Alten..."
              isClearable
            />
          </div>
          <div>
            <label htmlFor="referente_azienda" className="block mb-2 text-sm font-medium text-gray-900">Referente Azienda</label>
            <Select
              id="referente_azienda"
              name="referente_azienda"
              options={keyPeopleOptions}
              value={keyPeopleOptions.find(opt => opt.value === form.referente_azienda) || null}
              onChange={selected =>
                setForm({
                  ...form,
                  referente_azienda: selected ? selected.value : ""
                })
              }
              className="react-select-container"
              classNamePrefix="react-select"
              placeholder="Seleziona referente azienda..."
              isClearable
            />
          </div>
          <div>
            <label htmlFor="data" className="block mb-2 text-sm font-medium text-gray-900">Data</label>
            <input
              type="date"
              id="data"
              name="data"
              value={form.data}
              onChange={handleChange}
              className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-indigo-500 focus:border-indigo-500 block w-full p-2.5"
            />
          </div>
          <div>
            <label htmlFor="format" className="block mb-2 text-sm font-medium text-gray-900">Format</label>
            <select
              id="format"
              name="format"
              value={form.format}
              onChange={handleChange}
              className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-indigo-500 focus:border-indigo-500 block w-full p-2.5"
            >
              <option value="">Seleziona format</option>
              <option value="call">Call</option>
              <option value="SDG">SDG</option>
              <option value="cliente">Cliente</option>
            </select>
          </div>
          <div>
            <label htmlFor="trattativa" className="block mb-2 text-sm font-medium text-gray-900">Trattativa</label>
            <select
              id="trattativa"
              name="trattativa"
              value={form.trattativa}
              onChange={handleChange}
              className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-indigo-500 focus:border-indigo-500 block w-full p-2.5"
              disabled={!selectedCompanyObj}
            >
              <option value="">Seleziona trattativa</option>
              {trattativeForCompany.map(t => (
                <option key={t.id} value={t.id}>
                  {t.denominazione}
                </option>
              ))}
            </select>
          </div>
          <div className="md:col-span-2">
            <label htmlFor="referente_sdg" className="block mb-2 text-sm font-medium text-gray-900">
              Referenti SDG
            </label>
            <Select
              id="referente_sdg"
              name="referente_sdg"
              options={sdgOptions}
              isMulti
              value={sdgOptions.filter(opt => form.referente_sdg.includes(opt.value))}
              onChange={selected =>
                setForm({
                  ...form,
                  referente_sdg: selected ? selected.map(opt => opt.value) : []
                })
              }
              className="react-select-container"
              classNamePrefix="react-select"
              placeholder="Seleziona referenti SDG..."
            />
          </div>
        </div>
        <div className="mb-6">
          <label htmlFor="to_do" className="block mb-2 text-sm font-medium text-gray-900">To Do</label>
          <textarea
            id="to_do"
            name="to_do"
            value={form.to_do}
            onChange={handleChange}
            rows={3}
            className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-indigo-500 focus:border-indigo-500 block w-full p-2.5"
          />
        </div>
        <div className="mb-6">
          <label htmlFor="next_steps" className="block mb-2 text-sm font-medium text-gray-900">Next Steps</label>
          <textarea
            id="next_steps"
            name="next_steps"
            value={form.next_steps}
            onChange={handleChange}
            rows={3}
            className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-indigo-500 focus:border-indigo-500 block w-full p-2.5"
          />
        </div>
        <div className="mb-6">
          <label htmlFor="note" className="block mb-2 text-sm font-medium text-gray-900">Note</label>
          <textarea
            id="note"
            name="note"
            value={form.note}
            onChange={handleChange}
            rows={3}
            className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-indigo-500 focus:border-indigo-500 block w-full p-2.5"
          />
        </div>
        <div className="flex items-center justify-end gap-x-4">
          <button
            type="button"
            className="cursor-pointer px-6 py-2 rounded-lg border border-gray-300 bg-white text-gray-700 font-semibold hover:bg-gray-100 transition"
            onClick={() => setForm({
              cliente: "",
              trattativa: "",
              esito: "to start",
              referente_alten: "",
              referente_azienda: "",
              data: "",
              format: "",
              referente_sdg: [],
              to_do: "",
              next_steps: "",
              note: "",
            })}
          >
            Annulla
          </button>
          <button
            type="submit"
            className="cursor-pointer px-6 py-2 rounded-lg bg-gradient-to-br from-[#2A66DD] to-[#1DC8DF] text-white font-bold shadow hover:from-[#1DC8DF] hover:to-[#2A66DD] transition"
          >
            Salva
          </button>
        </div>
      </form>
    </div>
  );
}