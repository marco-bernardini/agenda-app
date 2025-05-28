import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import abstractBg from "/Abstract.jpg";

const searchWrapperClass =
  "relative inline-flex items-center justify-center p-0.5 mb-2 me-2 overflow-hidden text-sm font-medium rounded-lg group bg-gradient-to-br from-[#2A66DD] to-[#1DC8DF] focus:ring-4 focus:outline-none focus:ring-blue-100";
const searchInnerClass =
  "relative px-5 py-2.5 transition-all ease-in duration-75 bg-white rounded-md group-hover:bg-transparent";
const searchInputClass =
  "bg-transparent border-none outline-none text-gray-900 text-base font-medium min-w-[220px] max-w-[220px] transition-colors duration-150 group-hover:text-white group-hover:font-bold focus:text-white focus:font-bold";

export default function Companies() {
  const [companies, setCompanies] = useState([]);
  const [seenCompanies, setSeenCompanies] = useState(new Set());
  const [appointments, setAppointments] = useState([]);
  const [search, setSearch] = useState("");
  const [hoveredRow, setHoveredRow] = useState(null);
  const [tooltipPos, setTooltipPos] = useState({ top: 0, left: 0 });
  const [keyPeople, setKeyPeople] = useState([]);
  const tableRef = useRef();
  const navigate = useNavigate();

  useEffect(() => {
    // Fetch all companies
    fetch(`${import.meta.env.VITE_API_URL}/clienti`, {
      headers: { Authorization: "Bearer " + localStorage.getItem("token") },
    })
      .then(res => res.json())
      .then(setCompanies);

    // Fetch all appointments (with details, so we get denominazione_cliente and id_cliente)
    fetch(`${import.meta.env.VITE_API_URL}/appuntamenti?withDetails=1`, {
      headers: { Authorization: "Bearer " + localStorage.getItem("token") },
    })
      .then(res => res.json())
      .then(data => {
        setAppointments(data);
        // seenCompanies: set of company IDs that have at least one appointment
        const seen = new Set(data.map(a => a.id_cliente).filter(Boolean));
        setSeenCompanies(seen);
      });

    // Fetch all key people
    fetch(`${import.meta.env.VITE_API_URL}/key-people`, {
      headers: { Authorization: "Bearer " + localStorage.getItem("token") },
    })
      .then(res => res.json())
      .then(setKeyPeople);
  }, []);

  const columnMinWidth = [
    "40px", "180px", "110px", "110px", "70px", "130px", "100px", "160px", "120px"
  ];
  let lastCompany = null;
  let isGrey = false;

  // Filtering and sorting by denominazione_cliente (case-insensitive)
  const filteredCompanies = companies.filter(c =>
    (c.denominazione_cliente?.toLowerCase().includes(search.toLowerCase()) ||
     c.gruppo?.toLowerCase().includes(search.toLowerCase()))
  );
  const sortedCompanies = [...filteredCompanies].sort((a, b) => {
    const compA = a.denominazione_cliente || "";
    const compB = b.denominazione_cliente || "";
    return compA.localeCompare(compB);
  });

  function formatEuro(val) {
    if (!val || isNaN(Number(val))) return val || "";
    return (
      "€" +
      Number(val)
        .toLocaleString("it-IT", { maximumFractionDigits: 0 })
    );
  }

  // Tooltip for latest appointments for a company
  function getAppointmentsTooltip(companyId) {
    // Find appointments for this company (by id_cliente)
    const latest = appointments
      .filter(a => a.id_cliente === companyId)
      .sort((a, b) => new Date(b.data) - new Date(a.data))
      .slice(0, 3);
    if (!latest.length) return "Nessun appuntamento recente";
    return `
      <table style="border-collapse:collapse;width:100%;font-size:0.97em;">
        <thead>
          <tr>
            <th style="border-bottom:1px solid #ccc;padding:4px 8px;text-align:left;">Data</th>
            <th style="border-bottom:1px solid #ccc;padding:4px 8px;text-align:left;">Note</th>
            <th style="border-bottom:1px solid #ccc;padding:4px 8px;text-align:left;">Esito</th>
          </tr>
        </thead>
        <tbody>
          ${latest
            .map(
              a => `
              <tr>
                <td style="padding:4px 8px;">${a.data || "-"}</td>
                <td style="padding:4px 8px;">${a.note || "-"}</td>
                <td style="padding:4px 8px;">${a.esito || "-"}</td>
              </tr>
            `
            )
            .join("")}
        </tbody>
      </table>
    `;
  }

  function handleRowMouseEnter(e, companyId, idx) {
    setHoveredRow({ companyId, idx });
    const rect = e.currentTarget.getBoundingClientRect();
    setTooltipPos({
      top: rect.top + window.scrollY + rect.height,
      left: rect.left + window.scrollX + 20,
    });
  }

  function handleRowMouseLeave() {
    setHoveredRow(null);
  }

  // Helper: get key people for a company by company id
  function getKeyPeopleForCompany(companyId) {
    return keyPeople.filter(kp => kp.id_cliente === companyId);
  }

  return (
    <div
      className="flex flex-col w-full p-8"
      style={{
        height: "calc(100vh)",
        maxHeight: "calc(100vh)",
        width: "100%",
        backgroundImage: `url(${abstractBg})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        position: "relative",
        overflow: "auto",
        paddingTop: "110px",
      }}
    >
      <div className="flex items-center justify-between mb-4">
        <div className={searchWrapperClass}>
          <span className={searchInnerClass}>
            <input
              type="text"
              placeholder="Cerca cliente..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className={searchInputClass}
              style={{ minWidth: 220 }}
            />
          </span>
        </div>
      </div>
      <div className="flex-1 min-h-0 overflow-y-auto" ref={tableRef}>
        <table
          className="w-full text-left text-slate-800 table-fixed"
          style={{ minWidth: 0 }}
        >
          <colgroup>
            {columnMinWidth.map((w, i) => (
              <col key={i} style={{ minWidth: w, width: w }} />
            ))}
          </colgroup>
          <thead>
            <tr className="text-slate-500 border-b border-slate-300 text-white sticky top-0 z-10"
                style={{
                  background: "linear-gradient(135deg, #2A66DD 0%, #1DC8DF 100%)"
                }}>
              <th className="p-4 sticky top-0 z-10 bg-transparent"><p className="text-xl leading-none font-semi-bold">Vista</p></th>
              <th className="p-4 sticky top-0 z-10 bg-transparent"><p className="text-xl leading-none font-semi-bold">Cliente</p></th>
              <th className="p-4 sticky top-0 z-10 bg-transparent"><p className="text-xl leading-none font-semi-bold">Settore</p></th>
              <th className="p-4 sticky top-0 z-10 bg-transparent"><p className="text-xl leading-none font-semi-bold">Gruppo</p></th>
              <th className="p-4 sticky top-0 z-10 bg-transparent"><p className="text-xl leading-none font-semi-bold">Ramo</p></th>
              <th className="p-4 sticky top-0 z-10 bg-transparent"><p className="text-xl leading-none font-semi-bold">Capitale Sociale</p></th>
              <th className="p-4 sticky top-0 z-10 bg-transparent"><p className="text-xl leading-none font-semi-bold">Sede</p></th>
              <th className="p-4 sticky top-0 z-10 bg-transparent"><p className="text-xl leading-none font-semi-bold">Key People</p></th>
              <th className="p-4 sticky top-0 z-10 bg-transparent"><p className="text-xl leading-none font-semi-bold">Sito Web</p></th>
            </tr>
          </thead>
          <tbody>
            {sortedCompanies.map((c, idx) => {
              if (c.denominazione_cliente !== lastCompany) {
                isGrey = !isGrey;
                lastCompany = c.denominazione_cliente;
              }
              const rowBg = isGrey ? "bg-gray-100" : "bg-white";
              const showCompany = idx === 0 || c.denominazione_cliente !== sortedCompanies[idx - 1].denominazione_cliente;
              const isSeen = seenCompanies.has(c.id);
              const keyPeopleForCompany = getKeyPeopleForCompany(c.id);

              return (
                <tr
                  key={c.id}
                  className={`${rowBg} hover:bg-blue-50 relative`}
                  onMouseEnter={e => handleRowMouseEnter(e, c.id, idx)}
                  onMouseLeave={handleRowMouseLeave}
                  style={{ cursor: "pointer" }}
                >
                  <td className="p-4 text-center align-middle">
                    {showCompany && isSeen ? (
                      <span title="Vista">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="inline-block"
                          width={20}
                          height={20}
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <circle cx="12" cy="12" r="12" fill="#22c55e" />
                          <path
                            d="M8 12.5l3 3 5-5"
                            stroke="#fff"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      </span>
                    ) : null}
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      {c.sito_web ? (
                        <img
                          src={`https://logo.clearbit.com/${c.sito_web.replace(/^https?:\/\//, "")}`}
                          alt={c.denominazione_cliente}
                          className="w-7 h-7 rounded-full bg-white object-contain border border-gray-200"
                          style={{ minWidth: 28, minHeight: 28 }}
                          onError={e => {
                            e.target.onerror = null;
                            e.target.style.display = 'none';
                            const fallback = document.createElement('div');
                            fallback.style.width = '28px';
                            fallback.style.height = '28px';
                            fallback.style.borderRadius = '50%';
                            fallback.style.background = '#fff';
                            fallback.style.display = 'inline-block';
                            fallback.style.minWidth = '28px';
                            fallback.style.minHeight = '28px';
                            fallback.style.marginRight = '0.5rem';
                            e.target.parentNode.insertBefore(fallback, e.target.nextSibling);
                          }}
                        />
                      ) : (
                        <span
                          className="w-7 h-7 rounded-full bg-white inline-block"
                          style={{ minWidth: 28, minHeight: 28 }}
                        />
                      )}
                      {showCompany ? (
                        <p className="text-sm font-bold">{c.denominazione_cliente}</p>
                      ) : null}
                    </div>
                  </td>
                  <td className="p-4"><p className="text-sm">{c.settore}</p></td>
                  <td className="p-4"><p className="text-sm">{c.gruppo}</p></td>
                  <td className="p-4"><p className="text-sm">{c.ramo}</p></td>
                  <td className="p-4"><p className="text-sm">{formatEuro(c.capitale_sociale)}</p></td>
                  <td className="p-4"><p className="text-sm">{c.sede}</p></td>
                  <td className="p-4">
                    <div className="flex flex-wrap gap-2">
                      {keyPeopleForCompany.length === 0 ? (
                        <span className="text-gray-400 text-xs">-</span>
                      ) : (
                        keyPeopleForCompany.map(kp => (
                          <span
                            key={kp.id}
                            className="inline-block bg-blue-100 text-blue-800 text-xs font-semibold px-3 py-1 rounded-full border border-blue-300 cursor-pointer hover:bg-blue-200"
                            title={kp.ruolo ? kp.ruolo : undefined}
                            onClick={() =>
                              navigate(`/key-people?search=${encodeURIComponent(`${kp.nome} ${kp.cognome}`)}`)
                            }
                          >
                            {kp.nome} {kp.cognome}
                          </span>
                        ))
                      )}
                    </div>
                  </td>
                  <td className="p-4 break-all whitespace-pre-line">
                    {c.sito_web ? (
                      <a
                        href={c.sito_web}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 underline break-all"
                        style={{ wordBreak: "break-all", whiteSpace: "pre-line", display: "block" }}
                      >
                        {c.sito_web}
                      </a>
                    ) : ""}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      {hoveredRow && (
        <div
          style={{
            position: "absolute",
            zIndex: 100,
            pointerEvents: "none",
            top: tooltipPos.top,
            left: tooltipPos.left,
            minWidth: "350px",
            background: "#fff",
            border: "1px solid #cbd5e1",
            boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
            padding: "16px",
            borderRadius: "8px",
            color: "#222",
            fontSize: "0.95rem",
            fontFamily: "inherit",
          }}
          dangerouslySetInnerHTML={{
            __html: getAppointmentsTooltip(hoveredRow.companyId),
          }}
        />
      )}
    </div>
  );
}