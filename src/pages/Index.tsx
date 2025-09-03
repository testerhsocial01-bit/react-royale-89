import { ChatAppV2 } from "@/components/ChatAppV2";
import { useParams } from "react-router-dom";

const Index = () => {
  const { roomId } = useParams();
  return <ChatAppV2 roomId={roomId} />;
};

export default Index;
