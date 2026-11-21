import { useGetMenuQuery } from '../store/store';
import { useDispatch } from 'react-redux';
import { setCredentials } from '../store/authSlice';

interface MenuItemCard {
  id: number;
  name: string;
  description?: string | null;
  price: number;
  imageUrl?: string | null;
  category: string;
}

export function RestaurantMenu() {
  const { data: menu, isLoading, error } = useGetMenuQuery();
  const dispatch = useDispatch();

  if (isLoading) return <div className="text-center py-8">Loading menu...</div>;
  if (error) return <div className="text-center py-8 text-red-500">Error loading menu</div>;

  const categories = new Set(menu?.map((item) => item.category) || []);

  return (
    <div>
      <h2 className="text-3xl font-bold mb-6">Our Menu</h2>
      
      {Array.from(categories).map((category) => (
        <div key={category} className="mb-8">
          <h3 className="text-xl font-semibold mb-4">{category}</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {menu?.filter((item) => item.category === category).map((item) => (
              <MenuItemCard key={item.id} item={item} />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

function MenuItemCard({ item }: { item: MenuItemCard }) {
  const dispatch = useDispatch();

  const handleOrder = () => {
    // Dispatch order action (would integrate with RTK Query)
    alert('Order placed! (demo)');
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-4">
      <div className="flex justify-between items-start mb-2">
        <h4 className="font-semibold text-lg">{item.name}</h4>
        <span className="text-lg font-bold">₹{item.price}</span>
      </div>
      
      {item.description && (
        <p className="text-gray-600 text-sm mb-3">{item.description}</p>
      )}
      
      <div className="flex gap-2">
        <button
          onClick={handleOrder}
          className="flex-1 btn btn-primary"
        >
          Order
        </button>
        <button className="flex-1 btn btn-secondary">
          Add
        </button>
      </div>
    </div>
  );
}