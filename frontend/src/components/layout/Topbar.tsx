export function Topbar() {
  return (
    <header className="flex h-16 items-center justify-end border-b bg-white px-4 md:px-6">
      <div className="flex items-center gap-4">
        <span className="text-sm text-gray-600">Usuario</span>
        <div className="h-8 w-8 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center text-sm font-bold">
          U
        </div>
      </div>
    </header>
  );
}
