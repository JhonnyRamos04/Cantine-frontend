import { Dishes } from "./tabs/dishes";
import { Materials } from "./tabs/materials";
import { Product } from "./tabs/Product";
import { Profile } from "./tabs/profile";
import { Providers } from "./tabs/Providers";

export function DashboardContent({ activeCategory }) {
    return (
        <div className="p-6">
            {activeCategory === "productos" && <Product />}
            {activeCategory === "materiales" && <Materials />}
            {activeCategory === "provedores" && <Providers />}
            {activeCategory === "perfil" && <Profile />}
            {activeCategory === "platos" && <Dishes />}
        </div>
    )
}
