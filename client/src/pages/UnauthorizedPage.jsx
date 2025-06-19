import abstractBg from "/Abstract.jpg";

export default function UnauthorizedPage() {
  return (
    <div
      style={{
        height: "100vh",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        backgroundImage: `url(${abstractBg})`,
        backgroundSize: "cover",
        backgroundPosition: "center"
      }}
    >
      <div className="bg-white p-8 rounded-lg shadow-xl max-w-md w-full">
        <h1 className="text-2xl font-bold mb-4 text-red-600">Accesso Negato</h1>
        <p className="text-gray-700 mb-4">
          Non hai i permessi necessari per visualizzare questa pagina.
        </p>
        <a
          href="/appointments"
          className="text-blue-600 hover:text-blue-800 underline"
        >
          Torna alla pagina Appuntamenti
        </a>
      </div>
    </div>
  );
}