import { useEffect, useState, useMemo } from "react";
import { useLocation } from "react-router-dom";
import abstractBg from "/Abstract.jpg";

export default function KeyPeople() {
  const location = useLocation();
  const [keyPeople, setKeyPeople] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [selectedCompany, setSelectedCompany] = useState("all");
  const [selectedRole, setSelectedRole] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");

  // Get the search param from the URL on first render
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const searchFromUrl = params.get("search");
    if (searchFromUrl) setSearchTerm(searchFromUrl);
  }, [location.search]);

  useEffect(() => {
    fetch(`${import.meta.env.VITE_API_URL}/key-people`, {
      headers: { Authorization: "Bearer " + localStorage.getItem("token") },
    })
      .then(res => res.json())
      .then(data => {
        setKeyPeople(
          [...data].sort((a, b) =>
            (a.cognome || "").localeCompare(b.cognome || "")
          )
        );
      });

    fetch(`${import.meta.env.VITE_API_URL}/clienti`, {
      headers: { Authorization: "Bearer " + localStorage.getItem("token") },
    })
      .then(res => res.json())
      .then(setCompanies);
  }, []);

  function getInitials(nome, cognome) {
    return (
      (nome?.[0] || "").toUpperCase() +
      (cognome?.[0] || "").toUpperCase()
    );
  }

  // Get unique company names for filters
  const companyOptions = useMemo(
    () =>
      [
        ...new Set(
          keyPeople
            .map(kp => {
              const company = companies.find(c => c.id === kp.id_cliente);
              return company ? company.denominazione_cliente : null;
            })
            .filter(Boolean)
        ),
      ].sort(),
    [keyPeople, companies]
  );

  // Get unique roles for filters
  const roleOptions = useMemo(
    () =>
      [
        ...new Set(
          keyPeople.map(kp => kp.ruolo).filter(Boolean)
        ),
      ].sort(),
    [keyPeople]
  );

  // Filtered key people
  const filteredKeyPeople = keyPeople.filter(kp => {
    const company = companies.find(c => c.id === kp.id_cliente);
    const matchesCompany =
      selectedCompany === "all" ||
      (company && company.denominazione_cliente === selectedCompany);
    const matchesRole =
      selectedRole === "all" ||
      (kp.ruolo && kp.ruolo === selectedRole);
    const matchesSearch =
      !searchTerm ||
      `${kp.nome} ${kp.cognome}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
      `${kp.cognome} ${kp.nome}`.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCompany && matchesRole && matchesSearch;
  });

  // When adding a new key person, check for duplicates before submitting
  function handleAddKeyPerson(newPerson) {
    const duplicate = keyPeople.some(
      kp =>
        kp.nome.trim().toLowerCase() === newPerson.nome.trim().toLowerCase() &&
        kp.cognome.trim().toLowerCase() === newPerson.cognome.trim().toLowerCase() &&
        kp.id_cliente === newPerson.id_cliente
    );
    if (duplicate) {
      alert("Questa persona è già presente per questa compagnia.");
      return;
    }
    // ...proceed with your add logic (e.g., API call)...
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundImage: `url(${abstractBg})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        backgroundAttachment: "fixed",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        paddingTop: "72px",
      }}
    >
      {/* Filters */}
      <div className="w-full max-w-5xl mx-auto flex items-center gap-6 p-8">
        <h1 className="text-2xl font-bold text-gray-900 whitespace-nowrap ml-4">FILTRI</h1>
        <div className="flex flex-wrap gap-4">
          {/* Search filter for nome/cognome */}
          <div className="relative inline-flex items-center justify-center p-0.5 overflow-hidden text-sm font-medium rounded-lg group bg-gradient-to-br from-[#2A66DD] to-[#1DC8DF] focus:ring-4 focus:outline-none focus:ring-blue-100">
            <span className="relative px-5 py-2.5 transition-all ease-in duration-75 bg-white rounded-md group-hover:bg-transparent">
              <input
                type="text"
                placeholder="Tutti"
                className="bg-transparent border-none outline-none text-gray-900 text-base font-medium min-w-[180px] max-w-[180px] transition-colors duration-150 hover:text-white hover:font-bold focus:text-white focus:font-bold"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
              />
            </span>
          </div>
          <div className="relative inline-flex items-center justify-center p-0.5 overflow-hidden text-sm font-medium rounded-lg group bg-gradient-to-br from-[#2A66DD] to-[#1DC8DF] focus:ring-4 focus:outline-none focus:ring-blue-100">
            <span className="relative px-5 py-2.5 transition-all ease-in duration-75 bg-white rounded-md group-hover:bg-transparent">
              <select
                className="bg-transparent border-none outline-none text-gray-900 text-base font-medium min-w-[220px] max-w-[220px] transition-colors duration-150 hover:text-white hover:font-bold focus:text-white focus:font-bold"
                value={selectedCompany}
                onChange={e => setSelectedCompany(e.target.value)}
              >
                <option value="all">Tutte le compagnie</option>
                {companyOptions.map(comp => (
                  <option key={comp} value={comp}>{comp}</option>
                ))}
              </select>
            </span>
          </div>
          <div className="relative inline-flex items-center justify-center p-0.5 overflow-hidden text-sm font-medium rounded-lg group bg-gradient-to-br from-[#2A66DD] to-[#1DC8DF] focus:ring-4 focus:outline-none focus:ring-blue-100">
            <span className="relative px-5 py-2.5 transition-all ease-in duration-75 bg-white rounded-md group-hover:bg-transparent">
              <select
                className="bg-transparent border-none outline-none text-gray-900 text-base font-medium min-w-[180px] max-w-[180px] transition-colors duration-150 hover:text-white hover:font-bold focus:text-white focus:font-bold"
                value={selectedRole}
                onChange={e => setSelectedRole(e.target.value)}
              >
                <option value="all">Tutti i ruoli</option>
                {roleOptions.map(role => (
                  <option key={role} value={role}>{role}</option>
                ))}
              </select>
            </span>
          </div>
        </div>
      </div>
      {/* Cards grid */}
      <div className="w-full max-w-5xl mx-auto bg-white/90 rounded-xl shadow-xl p-8 pt-0">
        <div className="grid grid-cols-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8 ">
          {filteredKeyPeople.map(person => {
            const company = companies.find(c => c.id === person.id_cliente);
            return (
              <div
                key={person.id}
                className="flex flex-col items-center bg-white bg-gradient-to-br from-blue-100 to-blue-200 rounded-lg p-6 shadow-md hover:shadow-lg transition"
                style={{
                  border: "none",
                  boxShadow: "0 2px 8px 0 rgba(30, 64, 175, 0.10)",
                  minWidth: 0,
                }}
              >
                {company && company.sito_web ? (
                  <img
                    src={`https://logo.clearbit.com/${company.sito_web.replace(/^https?:\/\//, "")}`}
                    alt={company.denominazione_cliente}
                    className="w-20 h-20 rounded-full mb-3 object-contain bg-white"
                    onError={e => { e.target.style.display = 'none'; }}
                  />
                ) : (
                  <div className="w-20 h-20 rounded-full bg-blue-200 flex items-center justify-center text-2xl font-bold text-blue-700 mb-3 overflow-hidden">
                    {getInitials(person.nome, person.cognome)}
                  </div>
                )}
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-lg font-bold text-blue-900">
                    {person.nome} {person.cognome}
                  </span>
                  {person.linkedin && (
                    <a
                      href={person.linkedin}
                      target="_blank"
                      rel="noopener noreferrer"
                      title="LinkedIn"
                      className="ml-1"
                      style={{ display: "flex", alignItems: "center" }}
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width={22}
                        height={22}
                        viewBox="0 0 24 24"
                        fill="currentColor"
                        style={{ color: "#0A66C2", verticalAlign: "middle" }}
                      >
                        <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.761 0 5-2.239 5-5v-14c0-2.761-2.239-5-5-5zm-11 19h-3v-10h3v10zm-1.5-11.268c-.966 0-1.75-.784-1.75-1.75s.784-1.75 1.75-1.75 1.75.784 1.75 1.75-.784 1.75-1.75 1.75zm15.5 11.268h-3v-5.604c0-1.337-.025-3.063-1.868-3.063-1.868 0-2.154 1.459-2.154 2.967v5.7h-3v-10h2.881v1.367h.041c.401-.761 1.379-1.563 2.841-1.563 3.039 0 3.6 2.001 3.6 4.599v5.597z"/>
                      </svg>
                    </a>
                  )}
                </div>
                <div className="text-sm text-gray-500 italic mb-1">{person.ruolo}</div>
                {company && (
                  <div className="text-xs font-semibold text-gray-600 mb-1">{company.denominazione_cliente}</div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}