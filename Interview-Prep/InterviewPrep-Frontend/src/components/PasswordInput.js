import React, { useState, useEffect } from "react";
import { FaLock, FaEye, FaEyeSlash, FaExclamationTriangle } from "react-icons/fa";

/**
 * PasswordInput — a reusable password field with:
 *   • a show/hide (eye) toggle
 *   • a live "Caps Lock is on" warning hint
 *   • visibility that auto-resets to hidden when `resetSignal` changes
 *     (bump it after a successful submit so the password isn't left revealed)
 *
 * Renders the input group + caps hint only — the caller keeps its own <label>.
 *
 * Props:
 *   value, onChange           — controlled input (required)
 *   placeholder               — default "••••••••"
 *   autoFocus, required, disabled
 *   autoComplete              — e.g. "current-password" | "new-password"
 *   resetSignal               — any value; when it changes, visibility resets to hidden
 *   id, name
 */
const PasswordInput = ({
    value,
    onChange,
    placeholder = "••••••••",
    autoFocus = false,
    required = false,
    disabled = false,
    autoComplete = "current-password",
    resetSignal,
    id,
    name,
}) => {
    const [show, setShow] = useState(false);
    const [capsOn, setCapsOn] = useState(false);

    // Reset to hidden whenever the caller bumps resetSignal (e.g. after success).
    useEffect(() => {
        setShow(false);
    }, [resetSignal]);

    const updateCaps = (e) => {
        if (typeof e.getModifierState === "function") {
            setCapsOn(e.getModifierState("CapsLock"));
        }
    };

    return (
        <>
            <div className="relative">
                <FaLock className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <input
                    type={show ? "text" : "password"}
                    id={id}
                    name={name}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 pl-10 pr-10 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    placeholder={placeholder}
                    value={value}
                    onChange={onChange}
                    onKeyUp={updateCaps}
                    onKeyDown={updateCaps}
                    onBlur={() => setCapsOn(false)}
                    autoFocus={autoFocus}
                    required={required}
                    disabled={disabled}
                    autoComplete={autoComplete}
                />
                <button
                    type="button"
                    onClick={() => setShow((v) => !v)}
                    aria-label={show ? "Hide password" : "Show password"}
                    title={show ? "Hide password" : "Show password"}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors focus:outline-none"
                    tabIndex={-1}
                >
                    {show ? <FaEyeSlash /> : <FaEye />}
                </button>
            </div>
            {capsOn && (
                <p className="flex items-center gap-1.5 text-xs text-yellow-400 ml-1">
                    <FaExclamationTriangle className="w-3 h-3 flex-shrink-0" /> Caps Lock is on
                </p>
            )}
        </>
    );
};

export default PasswordInput;
