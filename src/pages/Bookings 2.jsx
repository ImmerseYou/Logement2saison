function Bookings() {
  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-4">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Mes réservations</h1>
          <div className="space-y-4">
            <p className="text-gray-600">
              Vous n'avez pas encore de réservations.
            </p>
            {/* Nous ajouterons la liste des réservations ici plus tard */}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Bookings
