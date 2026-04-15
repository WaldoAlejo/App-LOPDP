export function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100 px-4">
      <div className="w-full max-w-md rounded-xl bg-white p-8 shadow-lg">
        <h1 className="mb-2 text-center text-2xl font-bold text-gray-900">
          RAT Servientrega
        </h1>
        <p className="mb-6 text-center text-sm text-gray-500">
          Inicia sesión para continuar
        </p>
        <form className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Correo electrónico
            </label>
            <input
              type="email"
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
              placeholder="usuario@servientrega.com"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Contraseña
            </label>
            <input
              type="password"
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
              placeholder="••••••••"
            />
          </div>
          <button
            type="submit"
            className="w-full rounded-md bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
          >
            Ingresar
          </button>
        </form>
      </div>
    </div>
  );
}
