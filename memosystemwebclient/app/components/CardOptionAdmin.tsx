// components/CardOptionAdmin.tsx
import { Card, CardHeader, CardBody } from "@nextui-org/react";

interface CardOptionAdminProps {
    title: string;
    onClick: () => void; // Add an onClick prop
    icon: React.ReactNode; // Add an icon prop
}

const CardOptionAdmin = ({ title, onClick, icon }: CardOptionAdminProps) => {
    return (
        <Card isHoverable={true} isPressable={true} className=" w-full mb-4 cursor-pointer" onClick={onClick}>
            <CardHeader className="flex items-center text-black font-bold">
                <span className="mr-2">{icon}</span> {/* Render the icon */}
                {title}
            </CardHeader>
            <CardBody>
                {/* Optionally add some description or info here */}
            </CardBody>
        </Card>
    );
};

export default CardOptionAdmin;
