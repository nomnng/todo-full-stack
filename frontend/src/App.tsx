import { useState } from 'react'

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
      <section className="max-w-md mx-auto mt-10 p-6 bg-gray-500 rounded-lg shadow-md flex justify-center">
        <button
          type="button"
          className="px-4 py-2 bg-blue-500 rounded-md hover:bg-blue-600 transition"
          onClick={() => setCount((count) => count + 1)}
        >
          Count is {count}
        </button>
      </section>
    </>
  )
}

export default App
