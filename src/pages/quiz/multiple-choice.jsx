/* eslint-disable no-unused-vars */
/* eslint-disable react-hooks/exhaustive-deps */
import { Button, Progress } from "@/components";
import { ROUTE } from "@/lib/constants";
import { CancelDialog } from "@/sections/quiz";
import { CircleCheck } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useMicrophone } from "@/hooks";
import useSWR from "swr";
import { get } from "lodash";
import { fetcher } from "@/lib/fetcher";
import { MOCK_QUESTIONS } from "@/lib/mock";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import ScoreDialog from "@/sections/quiz/score-dialog";
import axios from "@/lib/axios";
import { HOVER_COLORS, OPTION_COLORS } from "@/lib/theme";

function validateIndex(questionData) {
  const correctAnswer = questionData?.answer || "";
  const sanitized = questionData?.options.findIndex(
    (option) => option.option === correctAnswer
  );

  return sanitized;
}

function validateTranscript(transcript, questionData) {
  const sanitized = transcript?.charAt(0);
  const index = questionData?.options.findIndex(
    (option) => option.option.charAt(0) === sanitized
  );

  return index;
}

export const MultipleChoicePage = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { transcript, resetTranscript, startListening, stopListening } = useMicrophone();

  const [countdown, setCountdown] = useState(40);
  const [cancelQuiz, setCancelQuiz] = useState(false);
  const [isShowScore, setIsShowScore] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState("");
  const [selectedOption, setSelectedOption] = useState("");
  const [numberQuiz, setNumberQuiz] = useState(1);
  const [score, setScore] = useState(0);
  const audioRef = useRef(null);

  // fetch data
  const { data: questionResponse } = useSWR(
    `/quiz/multiple-choice/${id}?number=${numberQuiz}`,
    fetcher,
    {
      shouldRetryOnError: false,
      revalidateOnFocus: false
    }
  );

  const questionList = questionResponse?.data || MOCK_QUESTIONS[numberQuiz];
  const audioUrl = questionResponse?.data?.question_audio_url || "";
  const totalQuestion = 5;

  const optionList = get(questionList, "options", []);
  const question = get(questionList, "question", "");

  const getBackgroundColor = (index, isHovered) => {
    if (selectedIndex === index) {
      return HOVER_COLORS[index % HOVER_COLORS.length];
    } else if (isHovered) {
      return HOVER_COLORS[index % HOVER_COLORS.length];
    } else {
      return OPTION_COLORS[index % OPTION_COLORS.length];
    }
  };

  const onHoverIn = (e, index) => {
    e.currentTarget.style.backgroundColor = getBackgroundColor(index, true);
  };

  const onHoverOut = (e, index) => {
    e.currentTarget.style.backgroundColor = getBackgroundColor(index, false);
  };

  const onSelectedAnswer = async (index, value) => {
    setSelectedIndex(index);
    setSelectedOption(value.key);

    const response = await axios.post(`/quiz/multiple-choice/${id}`, {
      answer: value.key,
      number: numberQuiz
    });

    if (response?.status === 200) {
      setScore((prevScore) => prevScore + 100 / totalQuestion);
      toast.success(`Skor anda adalah ${score}`, {
        position: "top-center",
        autoClose: 1000,
        pauseOnHover: false
      });
    } else {
      setScore((prevScore) => prevScore - 100 / totalQuestion);
      toast.error(`Maaf jawaban kamu salah`, {
        position: "top-center",
        autoClose: 1000,
        pauseOnHover: false
      });
    }

    setCountdown(0);
  };

  const handleBackButton = () => {
    setCancelQuiz(true);
  };

  const handleNext = () => {
    setNumberQuiz((prevPage) => prevPage + 1);
  };

  const handleNextQuiz = () => {
    if (numberQuiz >= totalQuestion) {
      setTimeout(() => {
        setSelectedIndex("");
        setSelectedOption("");
        stopListening();
        resetTranscript();
        setIsShowScore(true);
      }, 3000);
    } else {
      setTimeout(() => {
        setCountdown(40);
        setSelectedIndex("");
        setSelectedOption("");
        stopListening();
        handleNext();
        resetTranscript();
      }, 3000);
    }
  };

  const onCancelQuiz = () => {
    navigate(ROUTE.Home);
  };

  const renderCheckmark = (index) => {
    if (selectedIndex === index) {
      return (
        <div className='absolute top-2 right-2'>
          <Button variant='ghost' className='bg-accent' size='icon'>
            <CircleCheck />
          </Button>
        </div>
      );
    }
  };

  // useEffect(() => {
  //   if (transcript.includes(answer)) {
  //     setSelectedIndex(validateIndex(MOCK_QUESTIONS[numberQuiz]));
  //     setScore((prevScore) => prevScore + 100 / totalQuestion);
  //   } else {
  //     setSelectedIndex(
  //       validateTranscript(transcript, MOCK_QUESTIONS[numberQuiz])
  //     );
  //   }
  // }, [transcript]);

  useEffect(() => {
    if (audioUrl && audioRef.current) {
      audioRef.current.play().catch((error) => {
        console.error("Error playing the audio:", error);
      });
    }
  }, [audioUrl]);

  useEffect(() => {
    let timer;
    if (countdown > 0) {
      timer = setInterval(() => {
        setCountdown((prevCountdown) => prevCountdown - 1);
      }, 1000);
    }

    if (countdown <= 20 && countdown > 0) {
      startListening();
    } else if (countdown === 0) {
      handleNextQuiz();
    }

    return () => {
      clearInterval(timer);
    };
  }, [countdown, startListening]);

  return (
    <div className='mt-16 h-screen flex flex-col'>
      {audioUrl && (
        <audio
          ref={audioRef}
          autoPlay
          controls
          src={audioUrl}
          className='hidden'
        />
      )}
      <ToastContainer />
      <Progress
        value={(countdown / 40) * 100}
        className='w-full fixed top-0 left-0 rounded-none h-2 bg-green-500'
      />
      <div className='text-center pb-32'>
        <h1 className='text-4xl text-white font-poppins font-medium'>
          {question}
        </h1>
      </div>

      <div className='grid grid-cols-4 gap-4 text-center flex-grow'>
        {optionList.map((option, index) => (
          <button
            key={option.key}
            onClick={() => onSelectedAnswer(index, option)}
            className='relative w-full rounded-lg flex items-center justify-center h-full cursor-pointer transition-colors duration-300'
            style={{
              backgroundColor: getBackgroundColor(index, false),
              backgroundImage:
                "linear-gradient(to bottom, rgba(0,0,0,0) 0%, rgba(0,0,0,0.2) 100%)"
            }}
            onMouseEnter={(e) => onHoverIn(e, index)}
            onMouseLeave={(e) => onHoverOut(e, index)}
          >
            <h3 className='font-bold text-3xl font-poppins text-white'>
              {option.value}
            </h3>

            {renderCheckmark(index)}
            <div className='absolute bottom-0 rounded-b-lg w-full h-4 bg-black opacity-30'></div>
          </button>
        ))}
      </div>

      <Button
        onClick={handleBackButton}
        className='bg-red-500 mt-8 hover:bg-red-700 font-poppins font-bold text-white'
      >
        Kembali
      </Button>
      <CancelDialog
        onOpen={cancelQuiz}
        onOpenChange={setCancelQuiz}
        onCancel={onCancelQuiz}
      />
      <ScoreDialog onOpen={isShowScore} onBack={onCancelQuiz} score={score} />
    </div>
  );
};
