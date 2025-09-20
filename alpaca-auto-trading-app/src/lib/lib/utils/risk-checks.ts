import { RiskCheckSchema } from '../validations/trading';

export interface RiskCheckResult {
  passed: boolean;
  errors: string[];
  warnings: string[];
}

export async function performRiskChecks(orderData: any): Promise<RiskCheckResult> {
  const errors: string[] = [];
  const warnings: string[] = [];

  try {
    // Validate input data
    const validatedData = RiskCheckSchema.parse(orderData);

    // Check position size limits (max 10% of account value per position)
    const positionValue = validatedData.quantity * validatedData.price;
    const maxPositionValue = validatedData.accountValue * 0.10;
    
    if (positionValue > maxPositionValue) {
      errors.push(`Position size too large. Maximum allowed: $${maxPositionValue.toFixed(2)}`);
    }

    // Check if position would exceed 20% of account value
    const positionPercentage = (positionValue / validatedData.accountValue) * 100;
    if (positionPercentage > 20) {
      warnings.push(`Large position size: ${positionPercentage.toFixed(1)}% of account value`);
    }

    // Check for penny stocks (price < $5)
    if (validatedData.price < 5) {
      warnings.push('Trading penny stock - higher risk');
    }

    // Check for very small quantities (potential error)
    if (validatedData.quantity < 1) {
      errors.push('Quantity must be at least 1');
    }

    // Check for very large quantities (potential error)
    if (validatedData.quantity > 10000) {
      errors.push('Quantity seems unusually large - please verify');
    }

    return {
      passed: errors.length === 0,
      errors,
      warnings,
    };
  } catch (error) {
    return {
      passed: false,
      errors: ['Invalid order data provided'],
      warnings: [],
    };
  }
}
