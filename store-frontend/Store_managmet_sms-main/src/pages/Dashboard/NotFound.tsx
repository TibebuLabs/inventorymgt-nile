import { Link } from "react-router-dom";
import { FaArrowLeft, FaBoxes, FaCompass } from "react-icons/fa";
import { Button, Card } from "../../components/ui";

const NotFound = () => (
  <div className="flex min-h-[60vh] items-center justify-center">
    <Card className="max-w-md text-center">
      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-50 text-2xl text-blue-600 dark:bg-blue-500/15 dark:text-blue-400">
        <FaCompass />
      </div>
      <h1 className="mt-4 text-4xl font-black tracking-tight text-slate-900 dark:text-white">
        404
      </h1>
      <h2 className="mt-1 text-lg font-semibold text-slate-800 dark:text-slate-100">
        Page not found
      </h2>
      <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
        The page you are looking for does not exist or may have been moved.
      </p>
      <div className="mt-5 flex flex-wrap items-center justify-center gap-2">
        <Link to="/dashboard">
          <Button icon={<FaArrowLeft />}>Back to dashboard</Button>
        </Link>
        <Link to="/dashboard/stock">
          <Button variant="secondary" icon={<FaBoxes />}>
            Stock overview
          </Button>
        </Link>
      </div>
    </Card>
  </div>
);

export default NotFound;
