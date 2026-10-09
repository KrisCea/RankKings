import { estimateStrength, PASSWORD_MIN_LENGTH, STRENGTH_LABELS } from "../password";

const BAR_COLORS = ["bg-red-500", "bg-orange-500", "bg-yellow-500", "bg-lime-500", "bg-green-500"];
const TEXT_COLORS = [
  "text-red-500",
  "text-orange-500",
  "text-yellow-600",
  "text-lime-600",
  "text-green-600",
];

interface PasswordStrengthMeterProps {
  password: string;
  personal?: string[]; // usuario y correo, para detectar contraseñas que los contienen
}

export default function PasswordStrengthMeter({
  password,
  personal = [],
}: PasswordStrengthMeterProps) {
  if (!password) {
    return (
      <p className="text-xs text-foreground/50">
        Mínimo {PASSWORD_MIN_LENGTH} caracteres. Una frase larga de palabras sin relación funciona
        mejor que símbolos sueltos.
      </p>
    );
  }

  const score = estimateStrength(password, personal);
  const filled = Math.max(score, 1);

  return (
    <div>
      <div className="flex gap-1">
        {[1, 2, 3, 4].map((segment) => (
          <div
            key={segment}
            className={`h-1.5 flex-1 rounded-full transition-colors ${
              segment <= filled ? BAR_COLORS[score] : "bg-foreground/10"
            }`}
          />
        ))}
      </div>
      <p aria-live="polite" className={`mt-1 text-xs ${TEXT_COLORS[score]}`}>
        Seguridad: {STRENGTH_LABELS[score]}
      </p>
    </div>
  );
}