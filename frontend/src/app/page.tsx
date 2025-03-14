import LoginForm from '../components/LoginForm';

export default function Home() {
  return (
    <div className="flex items-center justify-center min-h-screen p-4 bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-700 transition-all duration-300">
      <LoginForm />
    </div>
  );
}
