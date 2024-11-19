// components/CardOption.tsx
import { Card, CardHeader } from "@nextui-org/react";
import { FaQuestionCircle, FaClipboardList, FaSearch } from "react-icons/fa";

type CardOptionTitle = "Post Question" | "My Tests" | "Search Course";

interface CardOptionProps {
    title: CardOptionTitle;
    onClick: () => void; // Add the onClick prop
}

const iconMap: Record<CardOptionTitle, JSX.Element> = {
    "Post Question": <FaQuestionCircle className="text-blue-500 text-xl" />,
    "My Tests": <FaClipboardList className="text-green-500 text-xl" />,
    "Search Course": <FaSearch className="text-purple-500 text-xl" />,
};

export default function CardOption({ title, onClick }: CardOptionProps) {
    return (
        <Card
            isPressable={true}
            isHoverable={true}
            className="w-full mb-4 cursor-pointer transform transition-transform duration-200 hover:scale-105 hover:shadow-md bg-white border border-gray-200 rounded-lg overflow-hidden"
            onClick={onClick}
        >
            <CardHeader className="flex items-center space-x-3 px-3 py-4">
                <div className="flex items-center justify-center w-10 h-10 rounded-full bg-gray-100">
                    {iconMap[title]}
                </div>
                <p className="text-md font-medium text-gray-800 tracking-wide">
                    {title}
                </p>
            </CardHeader>
        </Card>
    );
}
