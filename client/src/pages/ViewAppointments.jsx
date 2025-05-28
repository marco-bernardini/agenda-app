import { useEffect, useState, useMemo } from "react";
import { FaEdit, FaSave, FaTimes } from "react-icons/fa";
import { Link } from "react-router-dom";
import abstractBg from "/Abstract.jpg";
import Select from "react-select";

export default function ViewAppointments() {
  const [filter, setFilter] = useState("tutti");
  const [selectedCompany, setSelectedCompany] = useState("tutti");
  const [companies, setCompanies] = useState([]);
  const [appointmentSdgGroup, setAppointmentSdgGroup] = useState([]);
  const [sdgList, setSdgList] = useState([]);
  const [selectedSDG, setSelectedSDG] = useState("tutti");
  const [dateFilter, setDateFilter] = useState("tutti");
  const [appointments, setAppointments] = useState([]);
  const [editId, setEditId] = useState(null);
  const [editData, setEditData] = useState({});
  const [selectedBusinessUnit, setSelectedBusinessUnit] = useState("tutti");
  const [appointmentKeyPeople, setAppointmentKeyPeople] = useState([]);
  const [keyPeople, setKeyPeople] = useState([]);
  const [altenList, setAltenList] = useState([]);

  // Fetch all data including joins for appointments
  useEffect(() => {
    // Custom endpoint that returns appointments with cliente and referente_alten joined
    fetch(`${import.meta.env.VITE_API_URL}/appuntamenti?withDetails=1`, {
      headers: {
        Authorization: "Bearer " + localStorage.getItem("token"),
      },
    })
      .then(res => res.json())
      .then(setAppointments);
  }, []);

  useEffect(() => {
    fetch(`${import.meta.env.VITE_API_URL}/clienti`, {
      headers: {
        Authorization: "Bearer " + localStorage.getItem("token"),
      },
    })
      .then(res => res.json())
      .then(setCompanies);

    fetch(`${import.meta.env.VITE_API_URL}/sdg-group`, {
      headers: {
        Authorization: "Bearer " + localStorage.getItem("token"),
      },
    })
      .then(res => res.json())
      .then(setSdgList);

    fetch(`${import.meta.env.VITE_API_URL}/alten`, {
      headers: {
        Authorization: "Bearer " + localStorage.getItem("token"),
      },
    })
      .then(res => res.json())
      .then(setAltenList);
  }, []);

  useEffect(() => {
    fetch(`${import.meta.env.VITE_API_URL}/appuntamenti-sdg-group`, {
      headers: {
        Authorization: "Bearer " + localStorage.getItem("token"),
      },
    })
      .then(res => res.json())
      .then(setAppointmentSdgGroup);

    fetch(`${import.meta.env.VITE_API_URL}/key-people`, {
      headers: {
        Authorization: "Bearer " + localStorage.getItem("token"),
      },
    })
      .then(res => res.json())
      .then(setKeyPeople);

    fetch(`${import.meta.env.VITE_API_URL}/appuntamenti-key-people`, {
      headers: {
        Authorization: "Bearer " + localStorage.getItem("token"),
      },
    })
      .then(res => res.json())
      .then(setAppointmentKeyPeople);
  }, []);

  // Helper: get SDG nominativi for an appointment
  function getSdgsForAppointment(appointmentId) {
    const sdgGroupIds = appointmentSdgGroup
      .filter(row => row.id_appuntamento === appointmentId)
      .map(row => row.id_sdg);

    return sdgList
      .filter(sdg => sdgGroupIds.includes(sdg.id))
      .map(sdg => sdg.nominativo);
  }

  // Helper: get key people for an appointment
  function getKeyPeopleForAppointment(appointmentId) {
    const keyPersonIds = appointmentKeyPeople
      .filter(row => row.id_appuntamento === appointmentId)
      .map(row => row.id_person);

    return keyPeople
      .filter(kp => keyPersonIds.includes(kp.id))
      .map(kp => `${kp.nome} ${kp.cognome}`);
  }

  // Helper: get ruoli for an appointment (for struttura fallback)
  function getRuoliForAppointment(appointmentId) {
    const keyPersonIds = appointmentKeyPeople
      .filter(row => row.id_appuntamento === appointmentId)
      .map(row => row.id_person);

    return keyPeople
      .filter(kp => keyPersonIds.includes(kp.id) && kp.ruolo)
      .map(kp => kp.ruolo);
  }

  // Derive unique business units from sdgList
  const businessUnits = useMemo(
    () => [...new Set(sdgList.map(sdg => sdg.business_unit).filter(Boolean))],
    [sdgList]
  );

  // Filter logic
  const filteredAppointments = useMemo(() => {
    if (!Array.isArray(appointments)) return [];
    let filtered = appointments;

    // Industry filter
    if (filter && filter !== "tutti") {
      filtered = filtered.filter(a => a.cliente_settore === filter);
    }

    // Company filter
    if (selectedCompany && selectedCompany !== "tutti") {
      filtered = filtered.filter(a => a.denominazione_cliente === selectedCompany);
    }

    // Business unit filter
    if (selectedBusinessUnit && selectedBusinessUnit !== "tutti") {
      const sdgsInBU = sdgList
        .filter(sdg => sdg.business_unit === selectedBusinessUnit)
        .map(sdg => sdg.id);

      filtered = filtered.filter(a =>
        appointmentSdgGroup
          .filter(row => row.id_appuntamento === a.id)
          .some(row => sdgsInBU.includes(row.id_sdg))
      );
    }

    // SDG filter
    if (selectedSDG && selectedSDG !== "tutti") {
      filtered = filtered.filter(a =>
        getSdgsForAppointment(a.id).includes(selectedSDG)
      );
    }

    // Date filter
    if (dateFilter && dateFilter !== "tutti") {
      const now = new Date();
      filtered = filtered.filter(a => {
        if (!a.data) return false;
        const appDate = new Date(a.data);
        if (dateFilter === "programmati") {
          return appDate >= now;
        }
        if (dateFilter === "passati") {
          return appDate < now;
        }
        if (dateFilter === "da_verificare") {
          if (!(appDate < now)) return false;
          if (!a.next_steps || a.next_steps.trim() === "") return false;
          if (a.esito === "closed") return false;
          const hasFuture = appointments.some(
            b =>
              b.cliente_id === a.cliente_id &&
              new Date(b.data) > appDate
          );
          if (hasFuture) return false;
          return true;
        }
        return true;
      });
    }

    return filtered;
  }, [
    appointments,
    filter,
    selectedCompany,
    selectedBusinessUnit,
    selectedSDG,
    dateFilter,
    sdgList,
    companies,
    appointmentSdgGroup,
  ]);

  // Sort by company (denominazione_cliente) ASC, then by date DESC
  const sortedAppointments = [...filteredAppointments].sort((a, b) => {
    const clienteA = a.denominazione_cliente || "";
    const clienteB = b.denominazione_cliente || "";
    const cmp = clienteA.localeCompare(clienteB);
    if (cmp !== 0) return cmp;
    if (!a.data && !b.data) return 0;
    if (!a.data) return 1;
    if (!b.data) return -1;
    return b.data.localeCompare(a.data);
  });

  const columnMinWidth = "100px";
  let lastCliente = null;
  let isGrey = false;

  const handleEdit = (a) => {
    setEditId(a.id);
    setEditData({ ...a });
  };

  const handleCancel = () => {
    setEditId(null);
    setEditData({});
  };

  const handleChange = (field, value) => {
    setEditData(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = async (id) => {
    // Only send editable fields
    const payload = {
      esito: editData.esito,
      referente_alten: editData.referente_alten,
      struttura: editData.struttura,
      data: editData.data,
      format: editData.format,
      to_do: editData.to_do,
      next_steps: editData.next_steps,
      note: editData.note,
    };
    await fetch(`${import.meta.env.VITE_API_URL}/appuntamenti/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + localStorage.getItem("token"),
      },
      body: JSON.stringify(payload),
    });
    setEditId(null);
    setEditData({});
    fetch(`${import.meta.env.VITE_API_URL}/appuntamenti?withDetails=1`, {
      headers: {
        Authorization: "Bearer " + localStorage.getItem("token"),
      },
    })
      .then(res => res.json())
      .then(setAppointments);
  };

  const dropdownClass =
    "border rounded px-2 py-1 min-w-[180px] max-w-[180px] whitespace-normal break-words";
  const dropdownWrapperClass =
    "relative inline-flex items-center justify-center p-0.5 mb-2 me-2 overflow-hidden text-sm font-medium rounded-lg group bg-gradient-to-br from-[#2A66DD] to-[#1DC8DF] focus:ring-4 focus:outline-none focus:ring-blue-100";
  const dropdownInnerClass =
    "relative px-5 py-2.5 transition-all ease-in duration-75 bg-white rounded-md group-hover:bg-transparent";
  const dropdownSelectClass =
    "bg-transparent border-none outline-none text-gray-900 text-base font-medium min-w-[220px] max-w-[220px] transition-colors duration-150 hover:text-white hover:font-bold focus:text-white focus:font-bold";

  const filteredSdgList =
    selectedBusinessUnit === "tutti"
      ? sdgList
      : sdgList.filter(sdg => sdg.business_unit === selectedBusinessUnit);

  const sdgOptions = sdgList.map(sdg => ({
    value: sdg.id,
    label: `${sdg.nominativo} (${sdg.business_unit})`
  }));

  return (
    <div
      className="p-8"
      style={{
        height: "calc(100vh)",
        maxHeight: "calc(100vh)",
        backgroundImage: `url(${abstractBg})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        paddingTop: "100px",
      }}
    >
      <div className="flex items-center gap-4 mb-4 flex-wrap">
        <h1 className="text-2xl font-bold text-gray-900">FILTRI</h1>
        <div className={dropdownWrapperClass}>
          <span className={dropdownInnerClass}>
            <select
              className={dropdownSelectClass}
              value={filter}
              onChange={e => setFilter(e.target.value)}
            >
              <option value="tutti">Tutte le industry</option>
              <option value="Banking">Banking</option>
              <option value="Insurance">Insurance</option>
            </select>
          </span>
        </div>
        <div className={dropdownWrapperClass}>
          <span className={dropdownInnerClass}>
            <select
              className={dropdownSelectClass}
              value={selectedCompany}
              onChange={e => setSelectedCompany(e.target.value)}
            >
              <option value="tutti">Tutte le aziende</option>
              {[...new Set(companies.map(c => c.denominazione_cliente).filter(Boolean))].map(denominazioneCliente => (
                <option key={denominazioneCliente} value={denominazioneCliente}>
                  {denominazioneCliente}
                </option>
              ))}
            </select>
          </span>
        </div>
        <div className={dropdownWrapperClass}>
          <span className={dropdownInnerClass}>
            <select
              className={dropdownSelectClass}
              value={selectedBusinessUnit}
              onChange={e => {
                setSelectedBusinessUnit(e.target.value);
                setSelectedSDG("tutti");
              }}
            >
              <option value="tutti">Tutte le BU</option>
              {businessUnits.map(bu => (
                <option key={bu} value={bu}>{bu}</option>
              ))}
            </select>
          </span>
        </div>
        <div className={dropdownWrapperClass}>
          <span className={dropdownInnerClass}>
            <select
              className={dropdownSelectClass}
              value={selectedSDG}
              onChange={e => setSelectedSDG(e.target.value)}
            >
              <option value="tutti">Tutta SDG</option>
              {filteredSdgList.map(sdg => (
                <option key={sdg.id} value={sdg.nominativo}>{sdg.nominativo}</option>
              ))}
            </select>
          </span>
        </div>
        <div className={dropdownWrapperClass}>
          <span className={dropdownInnerClass}>
            <select
              className={dropdownSelectClass}
              value={dateFilter}
              onChange={e => setDateFilter(e.target.value)}
            >
              <option value="tutti">Tutte le date</option>
              <option value="programmati">App programmati</option>
              <option value="passati">App passati</option>
              <option value="da_verificare">App da verificare</option>
            </select>
          </span>
        </div>
      </div>
      <div className="flex-1 min-h-0" style={{ height: "90%", overflowY: "auto" }}>
        <table
          className="w-full min-w-max text-left text-slate-800"
          style={{ tableLayout: "fixed" }}
        >
          <thead>
            <tr
              className="text-slate-500 border-b border-slate-300 text-white sticky top-0 z-10"
              style={{
                background: "linear-gradient(135deg, #2A66DD 0%, #1DC8DF 100%)"
              }}
            >
              <th className="p-4 bg-transparent" style={{ minWidth: columnMinWidth }}>
                <p className="text-xl leading-none font-semi-bold">Cliente</p>
              </th>
              <th className="p-4 bg-transparent" style={{ minWidth: columnMinWidth }}>
                <p className="text-xl leading-none font-semi-bold">Esito</p>
              </th>
              <th className="p-4 bg-transparent" style={{ minWidth: columnMinWidth }}>
                <p className="text-xl leading-none font-semi-bold">Referente Alten</p>
              </th>
              <th className="p-4 bg-transparent" style={{ minWidth: columnMinWidth }}>
                <p className="text-xl leading-none font-semi-bold">Referente Azienda</p>
              </th>
              <th className="p-4 bg-transparent" style={{ minWidth: columnMinWidth }}>
                <p className="text-xl leading-none font-semi-bold">Struttura</p>
              </th>
              <th className="p-4 bg-transparent" style={{ minWidth: columnMinWidth }}>
                <p className="text-xl leading-none font-semi-bold">Data</p>
              </th>
              <th className="p-4 bg-transparent" style={{ minWidth: columnMinWidth }}>
                <p className="text-xl leading-none font-semi-bold">Format</p>
              </th>
              <th className="p-4 bg-transparent" style={{ minWidth: columnMinWidth }}>
                <p className="text-xl leading-none font-semi-bold">Referente SDG</p>
              </th>
              <th className="p-4 bg-transparent" style={{ minWidth: columnMinWidth }}>
                <p className="text-xl leading-none font-semi-bold">To Do</p>
              </th>
              <th className="p-4 bg-transparent" style={{ minWidth: columnMinWidth }}>
                <p className="text-xl leading-none font-semi-bold">Next Steps</p>
              </th>
              <th className="p-4 bg-transparent" style={{ minWidth: columnMinWidth }}>
                <p className="text-xl leading-none font-semi-bold">Note</p>
              </th>
              <th className="p-4 bg-transparent" style={{ minWidth: columnMinWidth }}>
                <p className="text-xl leading-none font-semi-bold">Azioni</p>
              </th>
            </tr>
          </thead>
          <tbody>
            {sortedAppointments.map((a, idx) => {
              const clienteName = a.denominazione_cliente || "";
              if (clienteName !== lastCliente) {
                isGrey = !isGrey;
                lastCliente = clienteName;
              }
              const rowBg = isGrey ? "bg-gray-100" : "bg-white";
              const showCliente = idx === 0 || clienteName !== (sortedAppointments[idx - 1]?.denominazione_cliente || "");
              const isEditing = editId === a.id;
              return (
                <tr key={a.id} className={`${rowBg} hover:bg-blue-50`}>
                  <td className="p-4" style={{ minWidth: columnMinWidth }}>
                    {showCliente ? <p className="text-sm font-bold">{clienteName}</p> : null}
                  </td>
                  <td className="p-4" style={{ minWidth: columnMinWidth }}>
                    {isEditing ? (
                      <select
                        className="border rounded px-2 py-1 w-full"
                        value={editData.esito || ""}
                        onChange={e => handleChange("esito", e.target.value)}
                      >
                        <option value="to start">to start</option>
                        <option value="ongoing">ongoing</option>
                        <option value="closed">closed</option>
                      </select>
                    ) : (
                      <span
                        className={
                          "px-3 py-1 rounded-full text-xs font-semibold " +
                          (a.esito === "ongoing"
                            ? "bg-green-100 text-green-800"
                            : a.esito === "to start"
                              ? "bg-blue-100 text-blue-800"
                              : a.esito === "closed"
                                ? "bg-red-100 text-red-800"
                                : "bg-gray-100 text-gray-800")
                        }
                      >
                        {a.esito}
                      </span>
                    )}
                  </td>
                  <td className="p-4" style={{ minWidth: columnMinWidth }}>
                    {isEditing ? (
                      <select
                        className="border rounded px-2 py-1 w-full"
                        value={editData.referente_alten || ""}
                        onChange={e => handleChange("referente_alten", e.target.value)}
                      >
                        <option value="">Seleziona referente Alten</option>
                        {altenList.map(alten => (
                          <option key={alten.id} value={alten.nominativo}>
                            {alten.nominativo}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <p className="text-sm">{a.referente_alten}</p>
                    )}
                  </td>
                  <td className="p-4" style={{ minWidth: columnMinWidth }}>
                    <div className="flex flex-wrap gap-1">
                      {getKeyPeopleForAppointment(a.id).map((person, idx) => (
                        <Link
                          key={idx}
                          to={`/key-people?search=${encodeURIComponent(person)}`}
                          className="inline-block bg-blue-100 text-blue-800 text-xs font-semibold px-3 py-1 rounded-full border border-blue-300 hover:bg-blue-200 cursor-pointer"
                          style={{ textDecoration: "none" }}
                          title={`Vai a Key People: ${person}`}
                        >
                          {person}
                        </Link>
                      ))}
                    </div>
                  </td>
                  <td className="p-4" style={{ minWidth: columnMinWidth }}>
                    {isEditing ? (
                      <input
                        className="border rounded px-2 py-1 w-full"
                        value={editData.struttura || ""}
                        onChange={e => handleChange("struttura", e.target.value)}
                      />
                    ) : (
                      <p className="text-sm">
                        {a.struttura && a.struttura.trim() !== ""
                          ? a.struttura
                          : (() => {
                              const ruoli = getRuoliForAppointment(a.id);
                              return ruoli.length > 0 ? ruoli.join(", ") : "";
                            })()
                        }
                      </p>
                    )}
                  </td>
                  <td className="p-4" style={{ minWidth: columnMinWidth }}>
                    {isEditing ? (
                      <input
                        type="date"
                        className="border rounded px-2 py-1 w-full"
                        value={editData.data || ""}
                        onChange={e => handleChange("data", e.target.value)}
                      />
                    ) : (
                      <p className="text-sm">
                        {a.data
                          ? new Date(a.data).toLocaleString("it-IT", {
                              day: "2-digit",
                              month: "2-digit",
                              year: "numeric",
                              hour: "2-digit",
                              minute: "2-digit"
                            })
                          : ""}
                      </p>
                    )}
                  </td>
                  <td className="p-4" style={{ minWidth: columnMinWidth }}>
                    {isEditing ? (
                      <input
                        className="border rounded px-2 py-1 w-full"
                        value={editData.format || ""}
                        onChange={e => handleChange("format", e.target.value)}
                      />
                    ) : (
                      <p className="text-sm">{a.format}</p>
                    )}
                  </td>
                  <td className="p-4" style={{ minWidth: columnMinWidth }}>
                    {isEditing ? (
                      <Select
                        isMulti
                        options={sdgOptions}
                        value={sdgOptions.filter(opt =>
                          appointmentSdgGroup
                            .filter(row => row.id_appuntamento === a.id)
                            .map(row => row.id_sdg)
                            .includes(opt.value)
                        )}
                        onChange={async selected => {
                          const selectedIds = selected ? selected.map(opt => opt.value) : [];
                          const currentIds = appointmentSdgGroup
                            .filter(row => row.id_appuntamento === a.id)
                            .map(row => row.id_sdg);

                          for (const id of selectedIds) {
                            if (!currentIds.includes(id)) {
                              await fetch(`${import.meta.env.VITE_API_URL}/appuntamenti-sdg-group`, {
                                method: "POST",
                                headers: {
                                  "Content-Type": "application/json",
                                  Authorization: "Bearer " + localStorage.getItem("token"),
                                },
                                body: JSON.stringify({
                                  id_appuntamento: a.id,
                                  id_sdg: id,
                                }),
                              });
                            }
                          }
                          fetch(`${import.meta.env.VITE_API_URL}/appuntamenti-sdg-group`, {
                            headers: {
                              Authorization: "Bearer " + localStorage.getItem("token"),
                            },
                          })
                            .then(res => res.json())
                            .then(setAppointmentSdgGroup);
                        }}
                        className="react-select-container"
                        classNamePrefix="react-select"
                        placeholder="Seleziona referente SDG..."
                      />
                    ) : (
                      <div className="flex flex-wrap gap-1">
                        {getSdgsForAppointment(a.id).map((sdg, idx) => (
                          <span
                            key={idx}
                            className="inline-block bg-blue-100 text-blue-800 text-xs font-semibold px-3 py-1 rounded-full border border-blue-300"
                          >
                            {sdg}
                          </span>
                        ))}
                      </div>
                    )}
                  </td>
                  <td className="p-4" style={{ minWidth: columnMinWidth }}>
                    {isEditing ? (
                      <input
                        className="border rounded px-2 py-1 w-full"
                        value={editData.to_do || ""}
                        onChange={e => handleChange("to_do", e.target.value)}
                      />
                    ) : (
                      <p className="text-sm whitespace-pre-line">{a.to_do}</p>
                    )}
                  </td>
                  <td className="p-4" style={{ minWidth: columnMinWidth }}>
                    {isEditing ? (
                      <input
                        className="border rounded px-2 py-1 w-full"
                        value={editData.next_steps || ""}
                        onChange={e => handleChange("next_steps", e.target.value)}
                      />
                    ) : (
                      <p className="text-sm whitespace-pre-line">{a.next_steps}</p>
                    )}
                  </td>
                  <td className="p-4" style={{ minWidth: columnMinWidth }}>
                    {isEditing ? (
                      <input
                        className="border rounded px-2 py-1 w-full"
                        value={editData.note || ""}
                        onChange={e => handleChange("note", e.target.value)}
                      />
                    ) : (
                      <p className="text-sm whitespace-pre-line">{a.note}</p>
                    )}
                  </td>
                  <td className="p-4" style={{ minWidth: columnMinWidth }}>
                    {isEditing ? (
                      <>
                        <button
                          className="text-primary mr-2 cursor-pointer text-2xl align-middle"
                          onClick={() => handleSave(a.id)}
                          title="Salva"
                        >
                          <FaSave />
                        </button>
                        <button
                          className="text-red-500 cursor-pointer text-2xl align-middle"
                          onClick={handleCancel}
                          title="Annulla"
                        >
                          <FaTimes />
                        </button>
                      </>
                    ) : (
                      <button
                        className="text-primary mr-2 cursor-pointer text-2xl align-middle"
                        onClick={() => handleEdit(a)}
                        title="Modifica"
                      >
                        <FaEdit />
                      </button>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}