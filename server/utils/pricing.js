const SIZE_MULTIPLIERS = {
  Small: 1.0,
  Medium: 1.25,
  Large: 1.5,
};

const MATERIAL_SURCHARGES = {
  PLA: 0,
  PETG: 80,
  ABS: 120,
  TPU: 150,
  Resin: 220,
};

function calculateUnitPrice(basePrice, material, size) {
  const numericBase = Number(basePrice) || 0;
  const sizeMultiplier = SIZE_MULTIPLIERS[size] || 1.0;
  const materialExtra = MATERIAL_SURCHARGES[material] || 0;
  return Math.round(numericBase * sizeMultiplier + materialExtra);
}

module.exports = {
  SIZE_MULTIPLIERS,
  MATERIAL_SURCHARGES,
  calculateUnitPrice,
};
