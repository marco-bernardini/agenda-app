import { useEffect, useState, useMemo } from "react";
import { FaEdit, FaSave, FaTimes } from "react-icons/fa";
import { Link, useNavigate } from "react-router-dom";
import abstractBg from "/Abstract.jpg";
import Select from "react-select";
import React from "react";
import { DateTime } from "luxon";

export default function ViewAppointments() {
  const navigate = useNavigate();

  const [filter, setFilter] = useState("tutti");
  const [selectedCompany, setSelectedCompany] = useState("tutti");
  const [appointmentSdgGroup, setAppointmentSdgGroup] = useState([]);
  const [sdgList, setSdgList] = useState([]);
  const [selectedSDG, setSelectedSDG] = useState("tutti");
  const [dateFilter, setDateFilter] = useState("tutti");
  const [appointments, setAppointments] = useState([]);
  const [editTrattativaId, setEditTrattativaId] = useState(null);
  const [editAppointmentId, setEditAppointmentId] = useState(null);
  const [editData, setEditData] = useState({});
  const [selectedBusinessUnit, setSelectedBusinessUnit] = useState("tutti");
  const [appointmentKeyPeople, setAppointmentKeyPeople] = useState([]);
  const [keyPeople, setKeyPeople] = useState([]);
  const [altenList, setAltenList] = useState([]);
  const [expanded, setExpanded] = useState({});
  const [trattative, setTrattative] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [editId, setEditId] = useState(null);
  const [editStatus, setEditStatus] = useState("");
  const [editStatusId, setEditStatusId] = useState(null);
  const [editStatusValue, setEditStatusValue] = useState("");

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

  useEffect(() => {
    fetch(`${import.meta.env.VITE_API_URL}/trattative`, {
      headers: { Authorization: "Bearer " + localStorage.getItem("token") }
    })
      .then(res => res.json())
      .then(setTrattative);
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

  // Refresh initiatives (trattative)
  function refreshInitiatives() {
    fetch(`${import.meta.env.VITE_API_URL}/trattative`, {
      headers: { Authorization: "Bearer " + localStorage.getItem("token") },
    })
      .then(res => res.json())
      .then(setTrattative); // or setInitiatives if you use a different state variable
  }

  // Refresh appointments
  function refreshAppointments() {
    fetch(`${import.meta.env.VITE_API_URL}/appuntamenti?withDetails=1`, {
      headers: { Authorization: "Bearer " + localStorage.getItem("token") },
    })
      .then(res => res.json())
      .then(setAppointments);
  }

  // Helper: get key people for an appointment
  function getKeyPeopleForAppointment(appointmentId) {
    const keyPersonIds = appointmentKeyPeople
      .filter(row => row.id_appuntamento === appointmentId)
      .map(row => row.id_person);

    return keyPeople
      .filter(kp => keyPersonIds.includes(kp.id))
      .map(kp => (
        <span
          key={kp.id}
          style={{
            display: "inline-block",
            borderRadius: "999px",
            border: "1px solid #60a5fa",
            background: "#e0f2fe",
            color: "#2563eb",
            padding: "2px 10px",
            margin: "2px 4px 2px 0",
            cursor: "pointer",
            fontSize: "0.85em",
            transition: "background 0.2s"
          }}
          onClick={e => {
            e.stopPropagation();
            navigate(`/key-people?personId=${kp.id}`);
          }}
          title="Vai ai dettagli del referente"
        >
          {kp.nome} {kp.cognome}
        </span>
      ));
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

  const [tasks, setTasks] = useState([]);

  useEffect(() => {
    fetch(`${import.meta.env.VITE_API_URL}/tasks`, {
      headers: { Authorization: "Bearer " + localStorage.getItem("token") }
    })
      .then(res => res.json())
      .then(setTasks);
  }, []);

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

  // For trattativa note
  const handleSave = async (id) => {
    // Only update note for trattativa
    await fetch(`${import.meta.env.VITE_API_URL}/trattative/${id}/note`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + localStorage.getItem("token"),
      },
      body: JSON.stringify({ note: editData.note }),
    });
    setEditTrattativaId(null);
    setEditData({});
    // Refresh trattative
    fetch(`${import.meta.env.VITE_API_URL}/trattative`, {
      headers: { Authorization: "Bearer " + localStorage.getItem("token") }
    })
      .then(res => res.json())
      .then(setTrattative);
  };

  // For appointments
  const handleSaveAppointment = async (id) => {
    // 1. Update the appointment fields (format, note, etc.)
    const appointmentPayload = {
      esito: editData.esito,
      // Always send YYYY-MM-DD, never a Date object or ISO string
      data: editData.data
        ? editData.data.length > 10
          ? editData.data.slice(0, 10)
          : editData.data
        : null,
      format: editData.format,
      to_do: editData.to_do,
      next_steps: editData.next_steps,
      note: editData.note,
    };
    console.log("PUT /appuntamenti/" + id, appointmentPayload);
    await fetch(`${import.meta.env.VITE_API_URL}/appuntamenti/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + localStorage.getItem("token"),
      },
      body: JSON.stringify(appointmentPayload),
    });

    // 1b. Update referente_alten if changed and not empty
    if (editData.referente_alten) {
      const id_alten = altenList.find(a => a.nominativo === editData.referente_alten)?.id;
      const altenPayload = {
        id_appuntamento: id,
        id_alten: id_alten,
      };
      console.log("POST /appuntamenti-alten", altenPayload);
      await fetch(`${import.meta.env.VITE_API_URL}/appuntamenti-alten`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + localStorage.getItem("token"),
        },
        body: JSON.stringify(altenPayload),
      });
    }

    // 2. Remove all old SDG relations for this appointment
    const oldLinks = appointmentSdgGroup.filter(row => row.id_appuntamento === id);
    for (const link of oldLinks) {
      const deletePayload = { id_appuntamento: id, id_sdg: link.id_sdg };
      console.log("DELETE /appuntamenti-sdg-group", deletePayload);
      await fetch(`${import.meta.env.VITE_API_URL}/appuntamenti-sdg-group`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + localStorage.getItem("token"),
        },
        body: JSON.stringify(deletePayload),
      });
    }

    // 3. Add new SDG relations (for each selected SDG)
    const selectedSdgs = sdgList.filter(sdg =>
      (editData.referente_sdg || []).includes(sdg.id)
    );
    for (const sdg of selectedSdgs) {
      const postPayload = { id_appuntamento: id, id_sdg: sdg.id };
      console.log("POST /appuntamenti-sdg-group", postPayload);
      await fetch(`${import.meta.env.VITE_API_URL}/appuntamenti-sdg-group`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + localStorage.getItem("token"),
        },
        body: JSON.stringify(postPayload),
      });
    }

    // 1c. Update key people for this appointment
    // Remove all old key people links for this appointment
    const oldKeyPeopleLinks = appointmentKeyPeople.filter(row => row.id_appuntamento === id);
    for (const link of oldKeyPeopleLinks) {
      const deletePayload = { id_appuntamento: id, id_person: link.id_person };
      await fetch(`${import.meta.env.VITE_API_URL}/appuntamenti-key-people`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + localStorage.getItem("token"),
        },
        body: JSON.stringify(deletePayload),
      });
    }

    // Add the new key person if selected
    if (editData.referente_azienda) {
      // Find the key person by nome+cognome
      const kp = keyPeople.find(
        k =>
          `${k.nome} ${k.cognome}` === editData.referente_azienda &&
          (k.id_cliente === (editData.id_cliente || editData.cliente_id))
      );
      if (kp) {
        const postPayload = { id_appuntamento: id, id_person: kp.id };
        await fetch(`${import.meta.env.VITE_API_URL}/appuntamenti-key-people`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: "Bearer " + localStorage.getItem("token"),
          },
          body: JSON.stringify(postPayload),
        });
      }
    }

    setEditAppointmentId(null);
    setEditData({});
    // Refresh appointments and joins after save
    await Promise.all([
      fetch(`${import.meta.env.VITE_API_URL}/appuntamenti?withDetails=1`, {
        headers: { Authorization: "Bearer " + localStorage.getItem("token") }
      }).then(res => res.json()).then(setAppointments),
      fetch(`${import.meta.env.VITE_API_URL}/appuntamenti-alten`, {
        headers: { Authorization: "Bearer " + localStorage.getItem("token") }
      }).then(res => res.json()).then(/* update your local state if needed */),
      fetch(`${import.meta.env.VITE_API_URL}/appuntamenti-sdg-group`, {
        headers: { Authorization: "Bearer " + localStorage.getItem("token") }
      }).then(res => res.json()).then(setAppointmentSdgGroup),
    ]);
  };

  const toggleExpand = (id) => {
    setExpanded(prev => ({ ...prev, [id]: !prev[id] }));
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

  const trattativeMap = useMemo(() => {
    const map = {};
    appointments.forEach(app => {
      if (!app.id_trattativa) return;
      if (!map[app.id_trattativa]) map[app.id_trattativa] = [];
      map[app.id_trattativa].push(app);
    });
    return map;
  }, [appointments]);

  const [newTaskForApp, setNewTaskForApp] = useState(null);
  const [newTaskDescrizione, setNewTaskDescrizione] = useState("");

  const trattativeList = useMemo(() => {
    // Helper: does at least one appointment for this trattativa match the filters?
    function matchesFilters(apps, trattativa) {
      const now = new Date();

      if (dateFilter === "programmati") {
        // At least one appointment with esito === "da fare"
        return apps.some(a => a.esito === "da fare");
      }

      if (dateFilter === "feedback") {
        // At least one appointment with esito === "attesa feedback"
        return apps.some(a => a.esito === "attesa feedback");
      }

      if (dateFilter === "senza_appuntamenti") {
        return trattative
          .filter(t => t.status === "to start" && (!trattativeMap[t.id] || trattativeMap[t.id].length === 0));
      }

      if (dateFilter === "da_verificare") {
        // At least one appointment with esito not in ["negativo", "closed", "progetto"]
        // Initiative status <> closed
        // No future appointments
        const hasValidApp = apps.some(
          a =>
            !["negativo", "closed", "progetto"].includes((a.esito || "").toLowerCase())
        );
        const hasFuture = apps.some(a => a.data && new Date(a.data) > now);
        return (
          hasValidApp &&
          trattativa.status !== "closed" &&
          !hasFuture
        );
      }

      // Standard logic: at least one appointment matches all filters
      return apps.some(a => {
        // Industry filter
        if (filter && filter !== "tutti" && a.cliente_settore !== filter) return false;
        // Company filter
        if (selectedCompany && selectedCompany !== "tutti" && a.denominazione_cliente !== selectedCompany) return false;
        // Business unit filter
        if (selectedBusinessUnit && selectedBusinessUnit !== "tutti") {
          const sdgsInBU = sdgList.filter(sdg => sdg.business_unit === selectedBusinessUnit).map(sdg => sdg.id);
          const appSdgs = appointmentSdgGroup.filter(row => row.id_appuntamento === a.id).map(row => row.id_sdg);
          if (!appSdgs.some(id => sdgsInBU.includes(id))) return false;
        }
        // SDG filter
        if (selectedSDG && selectedSDG !== "tutti") {
          const appSdgs = getSdgsForAppointment(a.id);
          if (!appSdgs.includes(selectedSDG)) return false;
        }
        // Date filter
        if (dateFilter && dateFilter !== "tutti") {
          const now = new Date();
          if (!a.data) return false;
          const appDate = new Date(a.data);
          if (dateFilter === "programmati" && appDate < now) return false;
          if (dateFilter === "passati" && appDate >= now) return false;
        }
        return true;
      });
    }

    // Build trattative list with logo and most recent appointment date
    const list = trattative
      .map(t => {
        const cliente = companies.find(c => c.id === t.id_cliente) || {};
        let logo = "";
        if (cliente.sito_web) {
          const domain = cliente.sito_web.replace(/^https?:\/\//, "");
          logo = `https://logo.clearbit.com/${domain}`;
        }
        const apps = trattativeMap[t.id] || [];
        const mostRecentDate = apps.length
          ? apps
              .map(a => a.data)
              .filter(Boolean)
              .sort((a, b) => new Date(b) - new Date(a))[0]
          : null;
        return {
          id: t.id,
          denominazione_cliente: cliente.denominazione_cliente,
          logo,
          settore_cliente: cliente.settore,
          status: t.status,
          denominazione: t.denominazione,
          struttura: t.struttura,
          note: t.note,
          owner: t.owner,
          mostRecentDate,
          appointments: apps,
        };
      })
      // Only keep trattative with at least one appointment matching the filters
      .filter(trattativa => matchesFilters(trattativa.appointments, trattativa))
      // Sort by most recent appointment date DESC
      .sort((a, b) => {
        if (!a.mostRecentDate && !b.mostRecentDate) return 0;
        if (!a.mostRecentDate) return 1;
        if (!b.mostRecentDate) return -1;
        return new Date(b.mostRecentDate) - new Date(a.mostRecentDate);
      });

    // Advanced filter: "senza_appuntamenti" (To Start with no appointments)
    if (dateFilter === "senza_appuntamenti") {
      return trattative
        .filter(t => t.status === "to start" && (!trattativeMap[t.id] || trattativeMap[t.id].length === 0))
        .map(t => {
          const cliente = companies.find(c => c.id === t.id_cliente) || {};
          let logo = "";
          if (cliente.sito_web) {
            const domain = cliente.sito_web.replace(/^https?:\/\//, "");
            logo = `https://logo.clearbit.com/${domain}`;
          }
          return {
            id: t.id,
            denominazione_cliente: cliente.denominazione_cliente,
            logo,
            settore_cliente: cliente.settore,
            status: t.status,
            denominazione: t.denominazione,
            struttura: t.struttura,
            note: t.note,
            owner: t.owner,
            mostRecentDate: null,
            appointments: [],
          };
        });
    }

    return list;
  }, [
    trattative,
    companies,
    trattativeMap,
    filter,
    selectedCompany,
    selectedBusinessUnit,
    selectedSDG,
    dateFilter,
    sdgList,
    appointmentSdgGroup,
    appointments,
  ]);

  // Add this utility function near the top of your component (before return)
  function cleanCompanyName(name) {
    if (!name) return "";
    const patterns = [
      /S\.?\s*P\.?\s*A\.?/gi,
      /SOCIET[ÀA] PER AZIONI/gi,
      /SOCIETA' PER AZIONI/gi,
    ];
    let cleaned = name;
    patterns.forEach(pattern => {
      cleaned = cleaned.replace(pattern, "");
    });
    // Remove extra spaces and trim
    return cleaned.replace(/\s{2,}/g, " ").trim();
  }

  // Place this function INSIDE the component, not after the closing }
  function getSdgsForAppointmentIds(appointmentId) {
    return appointmentSdgGroup
      .filter(row => row.id_appuntamento === appointmentId)
      .map(row => row.id_sdg);
  }

  function getKeyPeopleForAppointment(appointmentId) {
    const keyPersonIds = appointmentKeyPeople
      .filter(row => row.id_appuntamento === appointmentId)
      .map(row => row.id_person);

    return keyPeople
      .filter(kp => keyPersonIds.includes(kp.id))
      .map(kp => (
        <span
          key={kp.id}
          style={{
            display: "inline-block",
            borderRadius: "999px",
            border: "1px solid #60a5fa",
            background: "#e0f2fe",
            color: "#2563eb",
            padding: "2px 10px",
            margin: "2px 4px 2px 0",
            cursor: "pointer",
            fontSize: "0.85em",
            transition: "background 0.2s"
          }}
          onClick={e => {
            e.stopPropagation();
            navigate(`/key-people?search=${encodeURIComponent(`${kp.nome} ${kp.cognome}`)}`);
          }}
          title="Vai ai dettagli del referente"
        >
          {kp.nome} {kp.cognome}
        </span>
      ));
  }

  function getSdgsNominativiForAppointment(appointmentId) {
  const sdgIds = appointmentSdgGroup
    .filter(row => row.id_appuntamento === appointmentId)
    .map(row => row.id_sdg);
  return sdgList
    .filter(sdg => sdgIds.includes(sdg.id))
    .map(sdg => (
      <span
        key={sdg.id}
        style={{
          display: "inline-block",
          borderRadius: "999px",
          border: "1px solid #38bdf8",
          background: "#f0f9ff",
          color: "#0ea5e9",
          padding: "2px 10px",
          margin: "2px 4px 2px 0",
          fontSize: "0.85em"
        }}
      >
        {sdg.nominativo}
      </span>
    ));
}

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
      <div className="flex items-center gap-4 flex-wrap">
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
              <option value="tutti">Filtro avanzato</option>
              <option value="programmati">Da fare</option>
              <option value="feedback">Attesa feedback</option>
              <option value="da_verificare">Da verificare</option>
              <option value="senza_appuntamenti">Senza appuntamenti</option>
            </select>
          </span>
        </div>
      </div>
      <div className="flex-1 min-h-0" style={{ height: "90%", overflowY: "auto" }}>
        <div className="mt-4">
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
                <th className="p-4 bg-transparent" style={{ minWidth: "200px" }}>
                  <p className="text-xl leading-none font-semi-bold">Cliente</p>
                </th>
                <th className="p-4 bg-transparent" style={{ width: "100px" }}>
                  <p className="text-xl leading-none font-semi-bold">Settore</p>
                </th>
                <th className="p-4 bg-transparent" style={{ width: "100px" }}>
                  <p className="text-xl leading-none font-semi-bold">Status</p>
                </th>
                <th className="p-4 bg-transparent" style={{ width: "120px" }}>
                  <p className="text-xl leading-none font-semi-bold">Owner</p>
                </th>
                <th className="p-4 bg-transparent" style={{ minWidth: "200px" }}>
                  <p className="text-xl leading-none font-semi-bold">Iniziativa</p>
                </th>
                <th className="p-4 bg-transparent" style={{ minWidth: columnMinWidth }}>
                  <p className="text-xl leading-none font-semi-bold">Struttura</p>
                </th>
                <th className="p-4 bg-transparent" style={{ minWidth: columnMinWidth }}>
                  <p className="text-xl leading-none font-semi-bold">Note</p>
                </th>
              </tr>
            </thead>
            <tbody>
              {trattativeList.map((trattativa, idx) => (
                <React.Fragment key={trattativa.id}>
                  <tr
                    className={idx % 2 === 0 ? "bg-white hover:bg-blue-50" : "bg-gray-100 hover:bg-blue-50"}
                  >
                    <td className="p-4" style={{ minWidth: '200px' }}>
                      <button
                        onClick={() => toggleExpand(trattativa.id)}
                        className="mr-2 focus:outline-none"
                        style={{
                          background: "none",
                          border: "none",
                          padding: 0,
                          verticalAlign: "middle",
                          cursor: "pointer"
                        }}
                        aria-label={expanded[trattativa.id] ? "Chiudi dettagli" : "Espandi dettagli"}
                      >
                        {/* Chevron arrow */}
                        <svg
                          width="22"
                          height="22"
                          viewBox="0 0 24 24"
                          style={{
                            display: "inline",
                            verticalAlign: "middle",
                            transition: "transform 0.2s",
                            transform: expanded[trattativa.id] ? "rotate(90deg)" : "rotate(0deg)",
                            color: "#2A66DD"
                          }}
                          fill="none"
                          stroke="#23272f"
                          strokeWidth="3"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <polyline points="9 6 15 12 9 18" />
                        </svg>
                      </button>
                      {trattativa.logo ? (
                        <img
                          src={trattativa.logo}
                          alt="logo"
                          className="w-8 h-8 rounded-full bg-white object-contain border border-gray-200 inline-block mr-2 align-middle"
                          style={{ minWidth: 32, minHeight: 32 }}
                          onError={e => {
                            e.target.onerror = null;
                            e.target.style.display = 'none';
                          }}
                        />
                      ) : (
                        <span
                          className="w-8 h-8 rounded-full bg-white inline-block mr-2 align-middle"
                          style={{ minWidth: 32, minHeight: 32 }}
                        />
                      )}
                      <span className="text-sm font-bold align-middle">
                        {cleanCompanyName(trattativa.denominazione_cliente)}
                      </span>
                    </td>
                    <td className="p-4" style={{ minWidth: columnMinWidth }}>
                      <span className="text-sm">{trattativa.settore_cliente}</span>
                    </td>
                    <td
  className="p-4"
  style={{ width: "100px", cursor: "pointer" }}
  onDoubleClick={() => {
    setEditStatusId(trattativa.id);
    setEditStatusValue(trattativa.status);
  }}
>
  {editStatusId === trattativa.id ? (
    <select
      value={editStatusValue}
      onChange={async e => {
        const newStatus = e.target.value;
        setEditStatusValue(newStatus);
        await fetch(`${import.meta.env.VITE_API_URL}/trattative/${trattativa.id}/status`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: "Bearer " + localStorage.getItem("token"),
          },
          body: JSON.stringify({ status: newStatus }),
        });
        setEditStatusId(null);
        refreshInitiatives()
      }}
      className="border border-gray-300 rounded-lg px-2 py-1"
      autoFocus
    >
      <option value="to start">To Start</option>
      <option value="ongoing">Ongoing</option>
      <option value="on hold">On Hold</option>
      <option value="closed">Closed</option>
    </select>
  ) : (
    <span
      className={
        "px-3 py-1 rounded-full text-xs font-semibold " +
        (trattativa.status === "ongoing"
          ? "bg-green-100 text-green-800"
          : trattativa.status === "to start"
          ? "bg-blue-100 text-blue-800"          
          : trattativa.status === "on hold"
          ? "bg-orange-100 text-orange-800"
          : trattativa.status === "closed"
          ? "bg-red-100 text-red-800"
          : "bg-gray-100 text-gray-800")
      }
    >
      {trattativa.status}
    </span>
  )}
</td>
                    <td className="p-4" style={{ minWidth: "120px" }}>
                      <span className="text-sm flex items-center gap-2">
                        {trattativa.owner === "Alten" && (
                          <img
                            src="/alten-logo.jpg"
                            alt="Alten"
                            style={{ width: 20, height: 20, borderRadius: "50%", display: "inline-block" }}
                          />
                        )}
                        {trattativa.owner === "SDG" && (
                          <img
                            src="/sdg-logo.png"
                            alt="SDG"
                            style={{ width: 20, height: 20, borderRadius: "50%", display: "inline-block" }}
                          />
                        )}
                        {trattativa.owner || <span className="text-gray-400 italic">-</span>}
                      </span>
                    </td>
                    <td className="p-4" style={{ minWidth: "200px" }}>
                      <span className="text-sm">{trattativa.denominazione}</span>
                    </td>
                    <td className="p-4" style={{ minWidth: "200px" }}>
                      <span className="text-sm">{trattativa.struttura}</span>
                    </td>
                    {/* --- ONLY ONE NOTE COLUMN, EDITABLE --- */}
                    <td className="p-4" style={{ minWidth: columnMinWidth }}>
                      {editTrattativaId === trattativa.id ? (
                        <input
                          type="text"
                          className="w-full border rounded px-2 py-1"
                          value={editData.note || ""}
                          onChange={e => handleChange("note", e.target.value)}
                          onBlur={() => handleSave(trattativa.id)}
                          autoFocus
                          placeholder="Aggiungi una nota..."
                        />
                      ) : (
                        <span
                          className={`text-sm whitespace-pre-line cursor-pointer ${!trattativa.note ? "text-gray-400 italic" : ""}`}
                          onClick={() => {
                            setEditTrattativaId(trattativa.id);
                            setEditData({ note: trattativa.note || "" });
                          }}
                          title="Clicca per modificare"
                        >
                          {trattativa.note || "Aggiungi una nota..."}
                        </span>
                      )}
                    </td>
                  </tr>
                  {expanded[trattativa.id] && (
                    <tr>
                      <td colSpan={7} className="p-0"> {/* <-- colSpan matches the number of columns in the main table */}
                        <div style={{ width: "100%", overflowX: "auto" }}>
                          <table className="w-full text-left" style={{ background: "#23272f", tableLayout: "fixed", width: "100%" }}>
                            <thead>
                              <tr style={{ background: "#23272f" }}>
                                <th className="p-4" style={{ color: "#fff", width: "120px" }}>Data</th>
                                <th className="p-4" style={{ color: "#fff", width: "100px" }}>Esito</th>
                                <th className="p-4" style={{ color: "#fff", width: "80px" }}>Format</th>
                                <th className="p-4" style={{ color: "#fff" }}>Referente Azienda</th>
                                <th className="p-4" style={{ color: "#fff" }}>Referente SDG</th>
                                <th className="p-4" style={{ color: "#fff" }}>Referente Alten</th>
                                <th className="p-4" style={{ color: "#fff", minWidth: "200px" }}>Task</th>
                                <th className="p-4" style={{ color: "#fff" }}>Note</th>
                                <th className="p-4" style={{ color: "#fff", width: "80px" }}>Azioni</th>
                              </tr>
                            </thead>
                            <tbody>
                              {(trattativeMap[trattativa.id] || []).map(app => (
                                <tr key={app.id} className="hover:bg-slate-700">
                                  {editAppointmentId === app.id ? (
                                    <>
                                      <td className="p-4" style={{ color: "#23272f" }}>
                                      <input
                                        type="date"
                                        className="w-full border rounded px-2 py-1 text-black"
                                        value={
                                          editData.data
                                            ? DateTime.fromISO(editData.data, { zone: "utc" }).toFormat("yyyy-MM-dd")
                                            : ""
                                        }
                                        onChange={e => {handleChange("data", e.target.value);refreshAppointments();}}
                                      />
                                      </td>
                                      <td className="p-4" style={{ color: "#23272f" }}>
                                        <select
                                          className="w-full border rounded px-2 py-1 text-black"
                                          value={editData.esito || ""}
                                          onChange={e => {handleChange("esito", e.target.value);refreshAppointments();}}
                                        >
                                          <option value="">Seleziona</option>
                                        <option value="da fare">Da Fare</option>
                                        <option value="attesa feedback">Attesa Feedback</option>
                                        <option value="ritorno">Ritorno</option>              
                                        <option value="risentire">Risentire</option>
                                        <option value="progetto">Progetto</option>
                                        <option value="negativo">Negativo</option>
                                        </select>
                                      </td>
                                      <td className="p-4" style={{ color: "#23272f" }}>
                                        <select
                                          className="w-full border rounded px-2 py-1 text-black"
                                          value={editData.format || ""}
                                          onChange={e => {handleChange("format", e.target.value);refreshAppointments();}}
                                        >
                                          <option value="">Seleziona formato</option>
                                          <option value="Call">Call</option>
                                          <option value="SDG">SDG</option>
                                          <option value="Cliente">Cliente</option>
                                        </select>
                                      </td>
                                      <td className="p-4" style={{ color: "#23272f" }}>
                                        <select
                                          className="w-full border rounded px-2 py-1 text-black"
                                          value={editData.referente_azienda || ""}
                                          onChange={e => {handleChange("referente_azienda", e.target.value);refreshAppointments();}}
                                        >
                                          <option value="">Seleziona referente azienda</option>
                                          {Array.from(
                                          new Map(
                                            keyPeople
                                              .filter(kp => kp.id_cliente === (app.id_cliente || app.cliente_id))
                                              .map(kp => [`${kp.nome} ${kp.cognome}`, kp])
                                          ).values()
                                        ).map(kp => (
                                          <option key={kp.id} value={`${kp.nome} ${kp.cognome}`}>
                                            {kp.nome} {kp.cognome}
                                          </option>
                                        ))}
                                        </select>
                                      </td>
                                      <td className="p-4" style={{ color: "#23272f" }}>
                                        <Select
                                          isMulti
                                          options={sdgOptions}
                                          value={sdgOptions.filter(opt => (editData.referente_sdg || []).includes(opt.value))}
                                          onChange={selected =>
                                            handleChange(
                                              "referente_sdg",
                                              selected ? selected.map(opt => opt.value) : []
                                            )
                                          }
                                          className="react-select-container"
                                          classNamePrefix="react-select"
                                          placeholder="Seleziona referenti SDG..."
                                          styles={{
                                            control: (base) => ({
                                              ...base,
                                              minHeight: "38px",
                                              backgroundColor: "white",
                                            }),
                                            menu: (base) => ({
                                              ...base,
                                              color: "#23272f"
                                            })
                                          }}
                                        />
                                      </td>
                                      <td className="p-4" style={{ color: "#23272f" }}>
                                        <select
                                          className="w-full border rounded px-2 py-1 text-black"
                                          value={editData.referente_alten || ""}
                                          onChange={e => {handleChange("referente_alten", e.target.value);refreshAppointments();}}
                                        >
                                          <option value="">Seleziona referente Alten</option>
                                          {[...new Set(altenList.map(a => a.nominativo).filter(Boolean))].map(nominativo => (
                                            <option key={nominativo} value={nominativo}>{nominativo}</option>
                                          ))}
                                        </select>
                                      </td>
                                      <td className="p-4" style={{ color: "#23272f" }}>
                                        <input
                                          type="text"
                                          className="w-full border rounded px-2 py-1 text-black"
                                          value={editData.to_do || ""}
                                          onChange={e => {handleChange("to_do", e.target.value);refreshAppointments();} }
                                        />
                                      </td>
                                      <td className="p-4" style={{ color: "#23272f" }}>
                                        <input
                                          type="text"
                                          className="w-full border rounded px-2 py-1 text-black"
                                          value={editData.note || ""}
                                          onChange={e => {handleChange("note", e.target.value);refreshAppointments();} }
                                        />
                                      </td>
                                      <td className="p-4" style={{ color: "#fff" }}>
                                        <button
                                          className="mr-2 text-green-400 cursor-pointer"
                                          onClick={() => handleSaveAppointment(app.id)}
                                          title="Salva"
                                        >
                                          <FaSave />
                                        </button>
                                        <button
                                          className="text-red-400 cursor-pointer"
                                          onClick={() => {
                                            setEditAppointmentId(null);
                                            setEditData({});
                                          }}
                                          title="Annulla"
                                        >
                                          <FaTimes />
                                        </button>
                                      </td>
                                    </>
                                  ) : (
                                    <>
                                      <td className="p-4" style={{ color: "#fff" }}>
                                        <span className="text-sm">
                                          {app.data
                                            ? new Date(app.data).toLocaleDateString("it-IT", {
                                                day: "2-digit",
                                                month: "2-digit",
                                                year: "numeric"
                                              })
                                            : ""}
                                        </span>
                                      </td>
                                      <td className="p-4" style={{ color: "#fff" }}>
                                        <span
                                          className={
                                            "px-3 py-1 rounded-full text-xs font-semibold " +
                                            (app.esito === "ongoing"
                                              ? "bg-green-100 text-green-800"
                                              : app.esito === "to start"
                                              ? "bg-blue-100 text-blue-800"
                                              : app.esito === "da fare"
                                              ? "bg-blue-100 text-blue-800"
                                              : app.esito === "ritorno"
                                              ? "bg-green-100 text-green-800"
                                              : app.esito === "attesa feedback"
                                              ? "bg-orange-100 text-orange-800"
                                              : app.esito === "negativo"
                                              ? "bg-red-100 text-red-800"
                                              : app.esito === "closed"
                                              ? "bg-red-100 text-red-800"
                                              : "bg-gray-100 text-gray-800")
                                        }
                                        >
                                          {app.esito}
                                        </span>
                                      </td>
                                      <td className="p-4" style={{ color: "#fff" }}>
                                        <span className="text-sm">{app.format}</span>
                                      </td>
                                      <td className="p-4" style={{ color: "#fff" }}>
                                        <span className="text-sm">{getKeyPeopleForAppointment(app.id)}</span>
                                      </td>
                                      <td className="p-4" style={{ color: "#fff" }}>
                                        <span className="text-sm">{getSdgsNominativiForAppointment(app.id)}</span>
                                      </td>
                                      <td className="p-4" style={{ color: "#fff" }}>
                                        <span className="text-sm">{app.referente_alten}</span>
                                      </td>
                                      <td className="p-4" style={{ color: "#fff" }}>
                                     {(Array.isArray(tasks) ? tasks : [])
                                        .filter(task => task.id_appuntamento === app.id)
                                        .map(task => (
                                          <div
                                            key={task.id}
                                            style={{
                                              display: "flex",
                                              alignItems: "center",
                                              background: task.status ? "#dcfce7" : "#fee2e2",
                                              color: task.status ? "#166534" : "#991b1b",
                                              borderRadius: "6px",
                                              padding: "2px 8px",
                                              marginBottom: "4px",
                                              fontSize: "0.95em"
                                            }}
                                          >
                                            <input
                                              type="checkbox"
                                              checked={!!task.status}
                                              onChange={async () => {
                                                setTasks(prev =>
                                                  prev.map(t =>
                                                    t.id === task.id ? { ...t, status: !task.status } : t
                                                  )
                                                );
                                                await fetch(`${import.meta.env.VITE_API_URL}/tasks/${task.id}/status`, {
                                                  method: "PATCH",
                                                  headers: {
                                                    "Content-Type": "application/json",
                                                    Authorization: "Bearer " + localStorage.getItem("token"),
                                                  },
                                                  body: JSON.stringify({ status: !task.status }),
                                                });
                                              }}
                                              style={{ marginRight: "8px" }}
                                            />
                                            {task.descrizione}
                                          </div>
                                        ))}
                                      {editAppointmentId !== app.id && (
                                        <div style={{ marginTop: 4 }}>
                                          <button
                                            style={{
                                              background: "#38bdf8",
                                              color: "#fff",
                                              border: "none",
                                              borderRadius: "50%",
                                              width: 24,
                                              height: 24,
                                              fontSize: 18,
                                              cursor: "pointer",
                                              marginRight: 8,
                                              verticalAlign: "middle"
                                            }}
                                            title="Aggiungi task"
                                            onClick={() => setNewTaskForApp(app.id)}
                                          >
                                            +
                                          </button>
                                          {newTaskForApp === app.id && (
                                            <form
                                              style={{ display: "inline-block" }}
                                              onSubmit={async e => {
                                                e.preventDefault();
                                                if (!newTaskDescrizione.trim()) return;
                                                // POST new task
                                                const res = await fetch(`${import.meta.env.VITE_API_URL}/tasks`, {
                                                  method: "POST",
                                                  headers: {
                                                    "Content-Type": "application/json",
                                                    Authorization: "Bearer " + localStorage.getItem("token"),
                                                  },
                                                  body: JSON.stringify({
                                                    descrizione: newTaskDescrizione,
                                                    id_appuntamento: app.id,
                                                    status: false,
                                                  }),
                                                });
                                                if (res.ok) {
                                                  const created = await res.json();
                                                  setTasks(prev => [...prev, created]);
                                                  setNewTaskDescrizione("");
                                                  setNewTaskForApp(null);
                                                }
                                              }}
                                            >
                                              <input
                                                type="text"
                                                value={newTaskDescrizione}
                                                onChange={e => setNewTaskDescrizione(e.target.value)}
                                                placeholder="Nuovo task..."
                                                style={{ marginRight: 4, padding: "2px 6px", borderRadius: 4, border: "1px solid #ccc", color: "#23272f",}}
                                                autoFocus
                                              />
                                              <button type="submit" style={{
                                                background: "#22c55e",
                                                color: "#fff",
                                                border: "none",
                                                borderRadius: 4,
                                                padding: "2px 8px",
                                                cursor: "pointer"
                                              }}>Aggiungi</button>
                                            </form>
                                          )}
                                        </div>
                                      )}
                                      </td>
                                      <td className="p-4" style={{ color: "#fff" }}>
                                        <span className="text-sm whitespace-pre-line">{app.note}</span>
                                      </td>
                                      <td className="p-4" style={{ color: "#fff" }}>
                                        <button
                                          className="mr-2 text-blue-400 cursor-pointer"
                                          onClick={() => {
                                            // When entering edit mode for an appointment
                                            setEditAppointmentId(app.id);
                                            setEditData({
                                              ...app,
                                              data: app.data
                                                ? DateTime.fromISO(app.data).toFormat("yyyy-MM-dd")
                                                : "",
                                              referente_sdg: getSdgsForAppointmentIds(app.id),
                                            });
                                          }}
                                          title="Modifica"
                                        >
                                          <FaEdit />
                                        </button>
                                      </td>
                                    </>
                                  )}
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function getSdgsForAppointmentIds(appointmentId) {
  return appointmentSdgGroup
    .filter(row => row.id_appuntamento === appointmentId)
    .map(row => row.id_sdg);
}

async function saveStatus(id) {
  await fetch(`${import.meta.env.VITE_API_URL}/trattative/${id}/status`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer " + localStorage.getItem("token"),
    },
    body: JSON.stringify({ status: editStatus }),
  });
  setEditId(null);
  // Refresh initiatives list here
}