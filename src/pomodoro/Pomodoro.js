import React, { useState } from "react";
import useInterval from "../utils/useInterval";
import BreakControl from "./BreakControls";
import FocusControl from "./FocusControls";
import StartStop from "./StartStop";
import DisplayMessage from "./DisplayMessage";

// These functions are defined outside of the component to insure they do not have access to state
// and are, therefore more likely to be pure.

/**
 * Update the session state with new state after each tick of the interval.
 * @param prevState
 *  the previous session state
 * @returns
 *  new session state with timing information updated.
 */
function nextTick(prevState) {
  const timeRemaining = Math.max(0, prevState.timeRemaining - 1);
  return {
    ...prevState,
    timeRemaining,
  };
}

/**
 * Higher order function that returns a function to update the session state with the next session type upon timeout.
 * @param focusDuration
 *    the current focus duration
 * @param breakDuration
 *    the current break duration
 * @returns
 *  function to update the session state.
 */
function nextSession(focusDuration, breakDuration) {
  /**
   * State function to transition the current session type to the next session. e.g. On Break -> Focusing or Focusing -> On Break
   */
  return (currentSession) => {
    if (currentSession.label === "Focusing") {
      return {
        label: "On Break",
        timeRemaining: breakDuration * 60,
      };
    }
    return {
      label: "Focusing",
      timeRemaining: focusDuration * 60,
    };
  };
}

function Pomodoro() {
  // Timer starts out paused
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  // The current session - null where there is no session running
  const [session, setSession] = useState(null);

  // ToDo: Allow the user to adjust the focus and break duration.
  const [focusDuration, setFocusDuration] = useState(25);
  const [breakDuration, setBreakDuration] = useState(5);
  // grey out the plus and minus buttons for the focus and break duration while timer is running
  const [disableDurationBtns, setDisableDurationBtns] = useState(false);
  // handle stop button
  const [stopBtn, setStopBtn] = useState(false);
  // disable or grey out stop button when pressed
  const [disableStopBtn, setDisableStopBtn] = useState(true);
  const [progressBarAnimated, setProgressBarAnimated] = useState(0);
  

  const increaseBreak = () => {
    // the maximum break is 15 mintes and increase the break duration by 1 minute at a time
    setBreakDuration(Math.min(15, breakDuration + 1));
  };

  const decreaseBreak = () => {
    // the minimum break is one minute and decrease the overall break duration by 1 minute at a time
    setBreakDuration(Math.max(1, breakDuration - 1));
  };

  const increaseFocus = () => {
    // the maximum focus is 60 mintes and increase the break duration by 1 minute at a time
    setFocusDuration(Math.min(60, focusDuration + 5));
  };

  const decreaseFocus = () => {
    // the minimum focus is one minute and decrease the overall break duration by 1 minute at a time
    setFocusDuration(Math.max(5, focusDuration - 5));
  };

// adding handling event handler for the stop button
  function handleStopBtn() {
    setStopBtn(true);
    setDisableDurationBtns(false);
    setIsTimerRunning(false);
    setSession(null);
    setDisableStopBtn(true);
  }

  /**
   * Custom hook that invokes the callback function every second
   *
   * NOTE: You will not need to make changes to the callback function
   */
  useInterval(
    () => {
      if (session.timeRemaining === 0) {
        new Audio("https://bigsoundbank.com/UPLOAD/mp3/1482.mp3").play();
        return setSession(nextSession(focusDuration, breakDuration));
      }
      return setSession(nextTick);
    },
    isTimerRunning ? 1000 : null
  );

  /**
   * Called whenever the play/pause button is clicked.
   */
  function playPause() {
    // adding disable duration button state
    setDisableDurationBtns(true);
    //adding disable stop button state as false to prevent the disabling or greying out of the stop button
    setDisableStopBtn(false);
    setIsTimerRunning((prevState) => {
      const nextState = !prevState;
      if (nextState) {
        setSession((prevStateSession) => {
          // If the timer is starting and the previous session is null,
          // start a focusing session.
          if (prevStateSession === null) {
            return {
              label: "Focusing",
              timeRemaining: focusDuration * 60,
            };
          }
          return prevStateSession;
        });
      }
      return nextState;
    });
  }

 

  return (
    <div className="pomodoro">
      <div className="row">
      <FocusControl
        increaseFocus={increaseFocus}
        decreaseFocus={decreaseFocus}
        focusDuration={focusDuration}
        disableDurationBtns={disableDurationBtns}
      />
      <BreakControl
        increaseBreak={increaseBreak}
        decreaseBreak={decreaseBreak}
        breakDuration={breakDuration}
        disableDurationBtns={disableDurationBtns}
      />
      </div>
      <StartStop
        playPause={playPause}
        handleStopBtn={handleStopBtn}
        isTimerRunning={isTimerRunning}
        disableStopBtn={disableStopBtn}      
      />
      <DisplayMessage
        session={session}
        focusDuration={focusDuration}
        breakDuration={breakDuration}

      />
    </div>
  );
}

export default Pomodoro;
