import Header from "@/components/layout/header"

export const metadata = { title: "Track Your Order" }

const statusSteps = [
  { key: "PENDING", label: "Order Placed" },
  { key: "CONFIRMED", label: "Confirmed" },
  { key: "RECEIVED", label: "Bottle Received" },
  { key: "ASSESSING", label: "Assessment" },
  { key: "RECONDITIONING", label: "Reconditioning" },
  { key: "QUALITY_CHECK", label: "Quality Check" },
  { key: "READY", label: "Ready" },
  { key: "DELIVERED", label: "Delivered" },
]

export default function TrackPage({
  searchParams,
}: {
  searchParams: { order?: string }
}) {
  const orderNumber = searchParams.order

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <Header />
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Track Your Order</h1>
        <p className="text-gray-500 mb-10">Enter your order number to see the latest status of your bottle.</p>

        <form method="GET" action="/track" className="flex gap-3 mb-12">
          <input
            name="order"
            defaultValue={orderNumber}
            placeholder="Order number (e.g. AC-LK3F2M-X9P1)"
            className="flex-1 px-4 py-3 border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-rose-500"
          />
          <button
            type="submit"
            className="px-6 py-3 bg-rose-600 hover:bg-rose-700 text-white font-semibold rounded-xl transition-colors"
          >
            Track
          </button>
        </form>

        {orderNumber && (
          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-8">
            <div className="flex justify-between items-start mb-8">
              <div>
                <p className="text-sm text-gray-500 mb-1">Order Number</p>
                <p className="font-mono font-bold text-gray-900 dark:text-white">{orderNumber}</p>
              </div>
              <span className="bg-rose-100 text-rose-700 text-sm font-semibold px-3 py-1 rounded-full">
                In Progress
              </span>
            </div>

            {/* Progress Timeline */}
            <div className="space-y-0">
              {statusSteps.map((step, i) => {
                const isActive = i === 2 // demo: RECEIVED
                const isComplete = i < 2
                return (
                  <div key={step.key} className="flex gap-4">
                    <div className="flex flex-col items-center">
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                          isComplete
                            ? "bg-rose-600 text-white"
                            : isActive
                            ? "bg-rose-100 border-2 border-rose-600 text-rose-600"
                            : "bg-gray-100 dark:bg-gray-800 text-gray-400"
                        }`}
                      >
                        {isComplete ? "✓" : i + 1}
                      </div>
                      {i < statusSteps.length - 1 && (
                        <div className={`w-0.5 h-8 ${isComplete ? "bg-rose-600" : "bg-gray-100 dark:bg-gray-800"}`} />
                      )}
                    </div>
                    <div className="pb-8">
                      <p
                        className={`font-medium ${
                          isActive
                            ? "text-rose-600"
                            : isComplete
                            ? "text-gray-900 dark:text-white"
                            : "text-gray-400"
                        }`}
                      >
                        {step.label}
                      </p>
                      {isActive && (
                        <p className="text-sm text-gray-500 mt-0.5">Currently in progress</p>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
