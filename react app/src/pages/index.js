import { useState, useEffect } from "react";
import Head from 'next/head'
import Image from 'next/image'
import { Inter } from 'next/font/google'
import styles from '@/styles/Home.module.css'
import axios from 'axios';
import TypingAnimation from "../components/TypingAnimation";

const inter = Inter({ subsets: ['latin'] });
const keywords = ["hello","hey","fuck you","mining", "rules", "regulations", "coal", "iron ore", "bauxite", "manganese", "copper", "limestone", "dolomite", "mineral exploration", "mining lease", "mining plan", "environment clearance", "forest clearance", "rehabilitation and reclamation"];
let flag=true;
let msg="";
let respond="";
let quest="";

export default function Home() {
  const [inputValue, setInputValue] = useState('');
  const [chatLog, setChatLog] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedRole, setSelectedRole] = useState(null);
  const [roleQuestions, setRoleQuestions] = useState({}); // Store role-specific questions
  const [selectedQuestion, setSelectedQuestion] = useState(null);

  useEffect(() => {
    // Define role-specific questions
    const questions = {
      miner: [
        "What are the common risks in mining?",
        "Tell me about mining safety regulations.",
        "What equipment is used in underground mining?",
        "How deep can miners typically go?"
      ],
      supervisor: [
        "What are the responsibilities of a mining supervisor?",
        "How do you manage a mining team effectively?",
        "What are the key performance indicators for a mining supervisor?",
        "How to ensure safety in a mining operation?"
      ],
      student: [
        "What are the key mining Acts I should know as a student?",
        "Tell me about regulations for extracting specific minerals.",
        "Explain environmental rules in mining",
        "Tell me about sustainable mining practices."
      ]
    };
    setRoleQuestions(questions);
  }, []);

  const handleRoleSelect = (role) => {
    setSelectedRole(role);
    setChatLog([]);
    setSelectedQuestion(null); // Reset selected question
    // Start the conversation with role-specific greeting
    const initialGreeting = getInitialGreeting(role);
    setChatLog((prevChatLog) => [...prevChatLog, { type: 'bot', message: initialGreeting }]);
    // Display role-specific questions
    displayRoleSpecificQuestions(role);
  };

  const getInitialGreeting = (role) => {
    switch (role) {
      case "miner":
        return "Welcome, Miner! How can I assist you today?";
      case "supervisor":
        return "Hello, Supervisor! What do you need help with?";
      case "student":
        return "Greetings, Student! How can I support you?";
      default:
        return "Hello! Please select your role to get started.";
    }
  };

  const displayRoleSpecificQuestions = (role) => {
    const questions = roleQuestions[role];
    if (questions) {
      questions.forEach((question, index) => {
        setTimeout(() => {
          setChatLog((prevChatLog) => [...prevChatLog, { type: 'bot', message: question, clickable: true, index }]);
        }, 50 * index); // Display each question with a delay
      });
    }
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    msg = inputValue;
    if (selectedRole) {
      if(flag)
        setChatLog((prevChatLog) => prevChatLog.filter((item) => 0));
      setChatLog((prevChatLog) => [...prevChatLog, { type: 'user', message: inputValue }]);
      sendMessage(inputValue);
      setInputValue('');
      flag=false;
    } else {
      // Handle a case where the user hasn't selected a role yet.
      setChatLog((prevChatLog) => [...prevChatLog, { type: 'bot', message: "Please select a role first." }]);
      setInputValue('');
      console.log("Please select a role first.");
    }
  }

  const handleQuestionClick = (index) => {
    const question = chatLog.find((item) => item.index === index);
    quest=question.message;
    if (question) {
      setChatLog((prevChatLog) => [...prevChatLog, { type: 'user', message: question.message }]);
      // setSelectedQuestion(question);
      // Remove other questions by updating chatLog
      sendMessage(question.message);
      setChatLog((prevChatLog) => prevChatLog.filter((item) => item.index === index));
    }
  };

  const sendMessage = (message) => {
    const url = '/api/chat';

    const data = {
      model: "gpt-3.5-turbo-0301",
      messages: [
        { "role": "user", "content": message }
      ]
    };

    setIsLoading(true);

    axios.post(url, data).then((response) => {
      if (keywords.some((keyword) => msg.includes(keyword)) || keywords.some((keyword) => quest.includes(keyword))) {
        console.log(response.data);
        
        respond=response.data.choices[0].message.content;
        quest="";
        msg="";
        console.log(respond);
      }
      else{
        respond="I am sorry, I cannot help you with that. My knowledge is limited to mining rules and regulations.";
        console.log(respond);
      }
      console.log(response);
      setChatLog((prevChatLog) => [...prevChatLog, { type: 'bot', message: respond }]);
      setIsLoading(false);
    }).catch((error) => {
      setIsLoading(false);
      console.log(error);
    });
  };

  return (
    <div className="container mx-auto max-w-[700px]">
      <div className="flex flex-col min-h-screen bg-gray-900">
        <h3 className="bg-gradient-to-r from-blue-400 to-purple-600 text-transparent bg-clip-text text-center py-3 font-bold text-2xl">MineralMind</h3>
        {!selectedRole && (
          <div className="text-center p-6">
            <h2 className="text-white text-xl mb-2">Select your role:</h2>
            <div className="flex justify-center space-x-4">
              <button onClick={() => handleRoleSelect("miner")} className="bg-purple-500 rounded-lg px-4 py-2 text-white font-semibold focus:outline-none hover:bg-purple-600 transition-colors duration-300">Miner</button>
              <button onClick={() => handleRoleSelect("supervisor")} className="bg-purple-500 rounded-lg px-4 py-2 text-white font-semibold focus:outline-none hover:bg-purple-600 transition-colors duration-300">Supervisor</button>
              <button onClick={() => handleRoleSelect("student")} className="bg-purple-500 rounded-lg px-4 py-2 text-white font-semibold focus:outline-none hover:bg-purple-600 transition-colors duration-300">Student</button>
            </div>
          </div>
        )}
        <div className="flex-grow p-6">
          <div className="flex flex-col space-y-4">
            {chatLog.map((message, index) => (
              <div key={index} className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`${message.type === 'user' ? 'bg-purple-500' : 'bg-gray-800'} rounded-lg p-4 text-white max-w-sm ${message.clickable ? 'cursor-pointer hover:bg-purple-600' : ''}`} onClick={() => message.clickable && handleQuestionClick(message.index)}>
                  {message.message}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-gray-800 rounded-lg p-4 text-white max-w-sm">
                  <TypingAnimation />
                </div>
              </div>
            )}
            {/* Display solution when a question is selected */}
            {selectedQuestion && (
              <div className={`flex justify-${selectedQuestion.type === 'user' ? 'end' : 'start'}`}>
                <div className={`bg-purple-500 rounded-lg p-4 text-white max-w-sm`}>
                  {selectedQuestion.message}
                </div>
              </div>
            )}
          </div>
        </div>
        <form onSubmit={handleSubmit} className="flex-none p-6">
          <div className="flex rounded-lg border border-gray-700 bg-gray-800">
            <input type="text" className="flex-grow px-4 py-2 bg-transparent text-white focus:outline-none" placeholder="Type your message..." value={inputValue} onChange={(e) => setInputValue(e.target.value)} />
            <button type="submit" className="bg-purple-500 rounded-lg px-4 py-2 text-white font-semibold focus:outline-none hover:bg-purple-600 transition-colors duration-300">Send</button>
          </div>
        </form>
      </div>
    </div>
  )
}
