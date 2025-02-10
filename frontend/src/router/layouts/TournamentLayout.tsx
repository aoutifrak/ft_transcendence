import { useState, useEffect } from 'react';
import Tournamentpong from "./components/tournament/Tournamentpong";
import { useNavigate } from 'react-router-dom';

const Tournament = () => {
  const [playerNames, setPlayerNames] = useState({
    player1: '',
    player2: '',
    player3: '',
    player4: '',
  });

  const [gameStarted, setGameStarted] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  const [showPong, setShowPong] = useState(false);
  const [winner1, setWinner1] = useState<string | null>(null);
  const [winner2, setWinner2] = useState<string | null>(null);
  const [player1, setPlayer1] = useState<string | null>(null);
  const [player2, setPlayer2] = useState<string | null>(null);
  const [tournamentFinished, setTournamentFinished] = useState(false);

  const navigate = useNavigate();

  const handlePlayerNameChange = (e: any, player: any) => {
    if (gameStarted) return;
    setPlayerNames({
      ...playerNames,
      [player]: e.target.value,
    });
  };

  const handleStartGame = () => {
    setGameStarted(true);
    setShowPopup(true);
  };

  const handlePlay = () => {
    setShowPopup(false);
    setShowPong(true);
  };

  const handleGameEnd = (winner: string) => {
    if (!winner1 && winner === 'Player 1') {
      setWinner1(player1);
    } else if (!winner1 && winner === 'Player 2') {
      setWinner1(player2);
    } else if (winner1 && winner2) {
      setTournamentFinished(true);
    } else if (winner1 && winner === 'Player 1') {
      setWinner2(player1);
    } else if (winner1 && winner === 'Player 2') {
      setWinner2(player2);
    }
    setShowPong(false);
    setShowPopup(true);
  };

  const arePlayerNamesSet = Object.values(playerNames).every(name => name !== '');

  useEffect(() => {
    if (winner1 && !winner2) {
      setPlayer1(playerNames.player3);
      setPlayer2(playerNames.player4);
    } else if (winner1 && winner2 && winner1 === winner2 ) {
      setTournamentFinished(true);
    } else if (winner1 && winner2) {
      setPlayer1(winner1);
      setPlayer2(winner2);
    } else {
      setPlayer1(playerNames.player1);
      setPlayer2(playerNames.player2);
    }
  }, [winner1, winner2, playerNames, tournamentFinished]);

  const getPopupContent = () => {
    if (winner1 && !winner2) {
      return `${playerNames.player3} vs ${playerNames.player4}`;
    }
    if (winner1 && winner2) {
      return `${winner1} vs ${winner2}`;
    }
    return `${playerNames.player1} vs    ${playerNames.player2}`;
  };

  const hundlehome = () => {
    navigate("/"); 
  };

  return (
    <div className="min-h-screen  flex flex-col items-center justify-center p-8">
    {showPong ? (
      <Tournamentpong player1Name={player1} player2Name={player2} onGameEnd={handleGameEnd} />
    ) : (
        <>
          <h1 className="text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-300 to-pink-300 mb-12 uppercase tracking-wider relative">
            Tournament
          </h1>

          {!gameStarted && (
            <div className="flex justify-center items-center mb-8 flex gap-3">
              <input
                type="text"
                placeholder="Player 1 Alias"
                value={playerNames.player1}
                name="player1"
                onChange={(e) => handlePlayerNameChange(e, 'player1')}
                className="px-4 py-2 border rounded-lg"
                autoComplete="off"
              />
              <input
                type="text"
                placeholder="Player 2 Alias"
                name="player2"
                value={playerNames.player2}
                onChange={(e) => handlePlayerNameChange(e, 'player2')}
                className="px-4 py-2 border rounded-lg"
                autoComplete="off"
              />
              <input
                type="text"
                placeholder="Player 3 Alias"
                value={playerNames.player3}
                name="player3"
                onChange={(e) => handlePlayerNameChange(e, 'player3')}
                className="px-4 py-2 border rounded-lg"
                autoComplete="off"
              />
              <input
                type="text"
                placeholder="Player 4 Alias"
                value={playerNames.player4}
                name="player4"
                onChange={(e) => handlePlayerNameChange(e, 'player4')}
                className="px-4 py-2 border rounded-lg"
                autoComplete="off"
              />
            </div>
          )}

          <div className="flex justify-center items-center gap-32 relative">
            <div className="flex flex-col gap-32">
              <div className="relative">
                <div className="w-60 h-16 bg-purple-500 rounded-lg flex items-center justify-center text-white shadow-lg">
                  <span className="font-medium text-lg">{playerNames.player1 || 'Player 1'}</span>
                </div>
                <div className="absolute left-1/2 top-16 w-0.5 h-16 bg-purple-300" />
                <div className="mt-16">
                  <div className="w-60 h-16 bg-purple-500 rounded-lg flex items-center justify-center text-white shadow-lg">
                    <span className="font-medium text-lg">{playerNames.player2 || 'Player 2'}</span>
                  </div>
                </div>
              </div>
              <div className="relative">
                <div className="w-60 h-16 bg-purple-500 rounded-lg flex items-center justify-center text-white shadow-lg">
                  <span className="font-medium text-lg">{playerNames.player3 || 'Player 3'}</span>
                </div>
                <div className="absolute left-1/2 top-16 w-0.5 h-16 bg-purple-300" />
                <div className="mt-16">
                  <div className="w-60 h-16 bg-purple-500 rounded-lg flex items-center justify-center text-white shadow-lg">
                    <span className="font-medium text-lg">{playerNames.player4 || 'Player 4'}</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex flex-col gap-64 relative -ml-4">
              <div className="relative">
                <div className="w-60 h-16 bg-purple-500 rounded-lg flex items-center justify-center text-white shadow-lg">
                  <span className="font-medium text-lg">{winner1 || 'Winner 1'}</span>
                </div>
                <div className="absolute left-1/2 top-16 w-0.5 h-16 bg-purple-300" />
                <div className="mt-16">
                  <div className="w-60 h-16 bg-purple-500 rounded-lg flex items-center justify-center text-white shadow-lg">
                    <span className="font-medium text-lg">{winner2 || 'Winner 2'}</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="relative -ml-4">
              <div className="w-60 h-16 bg-purple-500 rounded-lg flex items-center justify-center text-white shadow-lg">
                <span className="font-medium text-lg">{tournamentFinished ? (winner1 || winner2) : 'Champion'}</span>
              </div>
            </div>
          </div>

          <div className="mt-12 space-x-4">
            {!gameStarted && (
              <button
                onClick={handleStartGame}
                disabled={!arePlayerNamesSet}
                className={`px-8 py-3 bg-[#ff3366] text-white rounded-lg hover:bg-[#ff3366]/80 transition-colors duration-200 font-semibold`}
              >
                Start Game
              </button>
            )}
          </div>
          {showPopup && !tournamentFinished && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/50 backdrop-blur-md">
              <div className="bg-[#1a103f]/90 p-20 rounded-lg  text-center ">
                <h2 className="text-5xl font-semibold text-white mb-8">
                  {getPopupContent()}
                </h2>
                <button
                  onClick={handlePlay}
                  className="px-10 py-3 bg-[#ff3366] text-white rounded-lg transition-colors duration-200 font-semibold"
                >
                  Play
                </button>
              </div>
            </div>
          )}
          {tournamentFinished && (
            <button
              onClick={hundlehome}
              className="px-8 py-3 mt-8 bg-gradient-to-r from-pink-600 to-purple-600 text-white rounded-lg text-lg font-medium shadow-lg hover:bg-pink-500"
            >
              Home
            </button>
          )}
        </>
      )}
    </div>
  );
};

export default Tournament;
