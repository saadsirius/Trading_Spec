import React from 'react';

interface TradeExplanationProps {
    explanation: string;
}

const TradeExplanation: React.FC<TradeExplanationProps> = ({ explanation }) => {
    return (
        <div className="trade-explanation">
            <h2 className="text-lg font-bold">Trade Explanation</h2>
            <p className="mt-2">{explanation}</p>
        </div>
    );
};

export default TradeExplanation;