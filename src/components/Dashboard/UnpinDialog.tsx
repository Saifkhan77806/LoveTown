import { PinOff } from "lucide-react";
import { useState } from "react";


const UnpinDialog = () => {
    const [showUnpinDialog, setShowUnpinDialog] = useState(false);

    return (
        <>
            <button
                onClick={() => setShowUnpinDialog(true)}
                className="w-full bg-gray-100 text-gray-700 py-3 rounded-xl font-medium hover:bg-gray-200 transition-all duration-200 flex items-center justify-center gap-2"
            >
                <PinOff size={18} />
                Not feeling it? Unpin match
            </button>

            {showUnpinDialog && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-6 z-50">
                    <div className="bg-white rounded-2xl p-6 max-w-sm w-full animate-slide-up">
                        <h3 className="text-xl font-semibold text-gray-900 mb-4">Take a moment to reflect</h3>
                        <p className="text-gray-600 mb-6">
                            Unpinning means taking a 24-hour break to reflect on what you're looking for.
                            Your partner will get a new match in 2 hours.
                        </p>
                        <div className="space-y-3">
                            <button
                                onClick={() => {
                                    setShowUnpinDialog(false);
                                }}
                                className="w-full bg-red-500 text-white py-3 rounded-xl font-medium"
                            >
                                Yes, unpin match
                            </button>
                            <button
                                onClick={() => setShowUnpinDialog(false)}
                                className="w-full bg-gray-100 text-gray-700 py-3 rounded-xl font-medium"
                            >
                                Keep exploring together
                            </button>
                        </div>
                    </div>
                </div>
            )}

        </>
    )
}

export default UnpinDialog