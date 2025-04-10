import { Card, CardContent, CardTitle } from "@/components";
import { ROUTE } from "@/lib/constants";
import { useAudioStore } from "@/zustand";
import PropTypes from "prop-types";
import { useNavigate } from "react-router-dom";

const BookList = ({ id, title, author, imageUrl }) => {
  const { isAudioEnabled } = useAudioStore();
  const navigate = useNavigate();

  const handleNavigate = () => {
    if (isAudioEnabled) {
      navigate(ROUTE.AudioBook + `/${id}`);
    } else {
      navigate(ROUTE.Book + `/${id}`);
    }
  };

  const trimmedTitle = () => {
    if (title.length > 20) {
      return title.substring(0, 10) + "...";
    }
    return title;
  };

  return (
    <Card
      onClick={handleNavigate}
      className='w-[250px] h-[450px] cursor-pointer flex flex-col bg-white shadow-md transition-transform transform hover:scale-105'
    >
      <div
        className='w-full h-3/4 md:h-3/4 bg-cover bg-center'
        style={{ backgroundImage: `url(${imageUrl})` }}
      ></div>
      <CardContent className='mt-6'>
        <CardTitle>{trimmedTitle()}</CardTitle>
        <h3 className='text-lg font-medium pt-2 text-gray-600'>{author}</h3>
      </CardContent>
    </Card>
  );
};

BookList.propTypes = {
  id: PropTypes.string.isRequired,
  title: PropTypes.string.isRequired,
  author: PropTypes.string.isRequired,
  imageUrl: PropTypes.string.isRequired,
};

export default BookList;
