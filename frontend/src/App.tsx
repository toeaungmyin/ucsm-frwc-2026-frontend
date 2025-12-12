import { Button, Card } from 'flowbite-react';

function App() {
  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-8 text-center">
          Frontend Setup Complete
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <h5 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
              Tailwind CSS
            </h5>
            <p className="font-normal text-gray-700 dark:text-gray-400">
              Utility-first CSS framework configured and ready to use.
            </p>
          </Card>

          <Card>
            <h5 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
              Flowbite React
            </h5>
            <p className="font-normal text-gray-700 dark:text-gray-400">
              Beautiful UI components built on top of Tailwind CSS.
            </p>
          </Card>

          <Card>
            <h5 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
              TanStack Query
            </h5>
            <p className="font-normal text-gray-700 dark:text-gray-400">
              Powerful data fetching and state management for async data.
            </p>
          </Card>

          <Card>
            <h5 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
              Axios + Zod
            </h5>
            <p className="font-normal text-gray-700 dark:text-gray-400">
              HTTP client with TypeScript-first schema validation.
            </p>
          </Card>
        </div>

        <div className="mt-8 flex justify-center gap-4">
          <Button color="blue">Get Started</Button>
          <Button color="gray">Learn More</Button>
        </div>
      </div>
    </div>
  );
}

export default App;
