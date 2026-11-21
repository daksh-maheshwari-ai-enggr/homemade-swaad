import { RestaurantMenu } from './components/RestaurantMenu';
import { OTPLoginModal } from './components/OTPLoginModal';

function App() {
  return (
    <main className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <h1 className="text-2xl font-bold text-gray-900">☁️ Cloud Kitchen</h1>
        </div>
      </header>
      
      <section className="container mx-auto px-4 py-8">
        <RestaurantMenu />
      </section>
      
      <OTPLoginModal />
    </main>
  );
}

export default App;