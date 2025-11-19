"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

interface MenuItem {
  path: string;
  title: string;
  icon?: React.ComponentType<{ size?: number }>;
  onClick?: () => void;
}

interface MenuLinkProps {
  item: MenuItem;
}

const MenuLink: React.FC<MenuLinkProps> = ({ item }) => {

  const pathname = usePathname();

  const handleClick = () => {
    if (item.onClick) {
      item.onClick();
    }
  };

  return (
    <Link
      href={item.path}
      onClick={handleClick}
      className={`flex gap-2 items-center h-[36px] px-3   rounded-lg transition-colors duration-300 ease-in-out ${
        pathname === item.path
          ? "text-[#ffffff] bg-[#262626] "
          : "text-[#A3A3A3] hover:text-[#ffffff] hover:bg-[262626] "
      }`}
    >
    
      <h5 className="text-sm">{item.title}</h5>
    </Link>
  );
};

export default MenuLink;
