import { Link } from "react-router-dom";
import logo from "../assets/logo.jpg";

const ink = "#223A2E";
const cream = "#F6F2E7";
const moss = "#5C7A56";
const gold = "#C98A2C";

export default function HomePage() {
  return (
    <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: cream }}>
      <div className="text-center px-6 max-w-sm">
        <img src={logo} alt="Bol Proteinis" style={{ width: "100%", maxWidth: 320, height: "auto", margin: "0 auto" }} />
        <p className="text-sm mt-4 mb-10" style={{ color: moss }}>
          Protein bowls, salads, smoothies and sandwiches, hand delivered to your door.
        </p>

        <Link
          to="/login"
          className="block w-full py-3 text-sm mb-3"
          style={{ backgroundColor: ink, color: cream, borderRadius: 6 }}
        >
          Order now — Login / Sign up
        </Link>

        <Link
          to="/admin-login"
          className="block w-full py-3 text-sm"
          style={{ border: `1px solid ${gold}`, color: gold, borderRadius: 6 }}
        >
          Admin login
        </Link>
      </div>
    </div>
  );
}
