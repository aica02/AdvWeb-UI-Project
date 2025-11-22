import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../App.css";

const HeroCarousel = () => {
  const books = [
    {
      id: 1,
      title: "Harry Potter and the Goblet of Fire",
      img: "https://m.media-amazon.com/images/I/91HHqVTAJQL.jpg",
      category: "Fantasy",
      description:
        "A thrilling continuation of the wizarding journey. Magic deepens and mysteries grow darker as secrets from the past unfold. Friendship and courage are tested against unseen forces. A world of spells and shadow awaits those who turn the page.",
    },
    {
      id: 2,
      title: "Educated: A Memoir",
      img: "https://covers.openlibrary.org/b/id/9254897-L.jpg",
      category: "Education",
      description:
        "A powerful story of a woman striving for knowledge against all odds. This book reminds readers of the transformative power of learning. It celebrates education as the key to personal freedom. A journey from isolation to enlightenment.",
    },
    {
      id: 3,
      title: "The Subtle Art of Not Giving a F*ck",
      img: "https://covers.openlibrary.org/b/id/8379381-L.jpg",
      category: "Lifestyle",
      description:
        "A refreshingly honest take on living meaningfully. This book challenges the obsession with positivity and success. It teaches readers to embrace flaws and focus on what truly matters. A guide for living authentically in a noisy world.",
    },
    {
      id: 4,
      title: "The Iliad by Homer",
      img: "https://covers.openlibrary.org/b/id/240727-L.jpg",
      category: "Humanities",
      description:
        "An ancient tale of heroism, pride, and destiny. The epic poem explores the complexity of human emotion amid war. It bridges history, philosophy, and literature in timeless prose. A cornerstone of human thought and culture.",
    },
    {
      id: 5,
      title: "Dracula",
      img: "https://covers.openlibrary.org/b/id/8231852-L.jpg",
      category: "Horror",
      description:
        "A chilling classic that defined the vampire genre. Dark, atmospheric, and filled with suspense, it delves into fear and fascination. The story examines obsession and morality under a haunting gothic shadow. A masterpiece of horror literature.",
    },
  ];
  const navigate = useNavigate();
  const [current, setCurrent] = useState(0);

  const nextSlide = () => {
    setCurrent((prev) => (prev + 1) % books.length);
  };

  const prevSlide = () => {
    setCurrent((prev) => (prev - 1 + books.length) % books.length);
  };

  const currentBook = books[current];

  return (
    <div className="hero-carousel"
      style={{
        backgroundImage: `linear-gradient(to bottom, rgba(255,255,255,0.4), rgba(0,0,0,0.8)), url(${currentBook.img})`,
      }}
    >
      <div className="carousel-overlay">
        <button className="arrow left" onClick={prevSlide}>❮</button>

        <div className="carousel-content">
          <div className="book-display">
            <div className="book-stack">
              <img
                src={books[(current - 1 + books.length) % books.length].img}
                alt="Previous"
                className="side-book left-book"
              />
              <img
                src={currentBook.img}
                alt={currentBook.title}
                className="main-book"
              />
              <img
                src={books[(current + 1) % books.length].img}
                alt="Next"
                className="side-book right-book"
              />
            </div>
          </div>

          <button className="arrow right" onClick={nextSlide}>❯</button>

          <div className="text-content">
            <h2>{currentBook.category} Books</h2>
            <p>{currentBook.description}</p>
            <button className="get-started" onClick={() => navigate("/viewAll")}>Get Started</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HeroCarousel;