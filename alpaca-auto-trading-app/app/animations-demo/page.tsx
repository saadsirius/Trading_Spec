'use client';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button, Card, CardContent, Typography, Box, Chip, Fab } from '@mui/material';
import { Add, Delete, Edit, Favorite, Share } from '@mui/icons-material';
import MaterialButton from '@/components/ui/MaterialButton';
import StickyNavbar from '@/components/StickyNavbar';

export default function AnimationsDemo() {
  const [items, setItems] = useState([
    { id: 1, title: 'AAPL', price: 150.25, change: 2.5 },
    { id: 2, title: 'MSFT', price: 380.50, change: -1.2 },
    { id: 3, title: 'GOOGL', price: 2800.75, change: 3.8 },
  ]);
  const [favorites, setFavorites] = useState<number[]>([]);
  const [showCards, setShowCards] = useState(true);

  const addItem = () => {
    const newItem = {
      id: Date.now(),
      title: `STOCK${Math.floor(Math.random() * 1000)}`,
      price: Math.random() * 500 + 50,
      change: (Math.random() - 0.5) * 10
    };
    setItems([...items, newItem]);
  };

  const removeItem = (id: number) => {
    setItems(items.filter(item => item.id !== id));
  };

  const toggleFavorite = (id: number) => {
    setFavorites(prev => 
      prev.includes(id) 
        ? prev.filter(fav => fav !== id)
        : [...prev, id]
    );
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20, scale: 0.8 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 25
      }
    },
    exit: {
      opacity: 0,
      x: -100,
      scale: 0.8,
      transition: {
        duration: 0.3
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-900">
      <StickyNavbar>
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <motion.h1
              className="text-2xl font-bold text-white"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
            >
              Animation Demo
            </motion.h1>
            
            <div className="flex gap-2">
              <MaterialButton
                variant="contained"
                color="primary"
                onClick={addItem}
                startIcon={<Add />}
              >
                Add Stock
              </MaterialButton>
              
              <MaterialButton
                variant="outlined"
                color="secondary"
                onClick={() => setShowCards(!showCards)}
              >
                {showCards ? 'Hide' : 'Show'} Cards
              </MaterialButton>
            </div>
          </div>
        </div>
      </StickyNavbar>

      <div className="pt-24 p-8">
        <div className="max-w-7xl mx-auto space-y-8">
          {/* Hero Section */}
          <motion.div
            className="text-center py-12"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <motion.h2
              className="text-4xl font-bold text-white mb-4"
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            >
              Framer Motion + Material-UI
            </motion.h2>
            <motion.p
              className="text-xl text-gray-400"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
            >
              Advanced animations and interactions for modern web applications
            </motion.p>
          </motion.div>

          {/* Animation Showcase */}
          <motion.div
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            {/* Hover Animations */}
            <motion.div variants={itemVariants}>
              <Card className="bg-gray-800 text-white">
                <CardContent>
                  <Typography variant="h6" className="mb-4">
                    Hover Effects
                  </Typography>
                  <div className="space-y-3">
                    {['Scale', 'Rotate', 'Glow', 'Slide'].map((effect, index) => (
                      <motion.div
                        key={effect}
                        className="p-3 bg-gray-700 rounded cursor-pointer"
                        whileHover={{ 
                          scale: 1.05,
                          rotate: effect === 'Rotate' ? 5 : 0,
                          boxShadow: effect === 'Glow' ? '0 0 20px rgba(59, 130, 246, 0.5)' : '0 4px 12px rgba(0, 0, 0, 0.3)',
                          x: effect === 'Slide' ? 10 : 0
                        }}
                        transition={{ type: "spring", stiffness: 400, damping: 17 }}
                      >
                        {effect} Effect
                      </motion.div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Loading Animations */}
            <motion.div variants={itemVariants}>
              <Card className="bg-gray-800 text-white">
                <CardContent>
                  <Typography variant="h6" className="mb-4">
                    Loading States
                  </Typography>
                  <div className="space-y-3">
                    <motion.div
                      className="w-full h-2 bg-gray-700 rounded overflow-hidden"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                    >
                      <motion.div
                        className="h-full bg-blue-500"
                        initial={{ width: 0 }}
                        animate={{ width: "100%" }}
                        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                      />
                    </motion.div>
                    
                    <motion.div
                      className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto"
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    />
                    
                    <motion.div
                      className="flex justify-center space-x-1"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                    >
                      {[0, 1, 2].map((i) => (
                        <motion.div
                          key={i}
                          className="w-2 h-2 bg-blue-500 rounded-full"
                          animate={{ scale: [1, 1.5, 1] }}
                          transition={{
                            duration: 0.6,
                            repeat: Infinity,
                            delay: i * 0.2
                          }}
                        />
                      ))}
                    </motion.div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Interactive Elements */}
            <motion.div variants={itemVariants}>
              <Card className="bg-gray-800 text-white">
                <CardContent>
                  <Typography variant="h6" className="mb-4">
                    Interactive Elements
                  </Typography>
                  <div className="space-y-3">
                    <MaterialButton
                      variant="contained"
                      fullWidth
                      onClick={() => {}}
                    >
                      Ripple Button
                    </MaterialButton>
                    
                    <div className="flex justify-center">
                      <motion.div
                        className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full cursor-pointer flex items-center justify-center"
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        animate={{ rotate: 360 }}
                        transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                      >
                        <Favorite className="text-white" />
                      </motion.div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </motion.div>

          {/* Dynamic List */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
          >
            <Typography variant="h4" className="text-white mb-6">
              Dynamic Stock List
            </Typography>
            
            <AnimatePresence>
              {showCards && (
                <motion.div
                  className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
                  variants={containerVariants}
                  initial="hidden"
                  animate="visible"
                  exit="hidden"
                >
                  {items.map((item) => (
                    <motion.div
                      key={item.id}
                      variants={itemVariants}
                      layout
                      whileHover={{ scale: 1.02, y: -5 }}
                    >
                      <Card className="bg-gray-800 text-white">
                        <CardContent>
                          <div className="flex items-center justify-between mb-2">
                            <Typography variant="h6">{item.title}</Typography>
                            <motion.button
                              onClick={() => toggleFavorite(item.id)}
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                            >
                              <Favorite 
                                className={favorites.includes(item.id) ? 'text-red-500' : 'text-gray-400'} 
                              />
                            </motion.button>
                          </div>
                          
                          <Typography variant="h5" className="mb-2">
                            ${item.price.toFixed(2)}
                          </Typography>
                          
                          <Chip
                            label={`${item.change > 0 ? '+' : ''}${item.change.toFixed(2)}%`}
                            color={item.change > 0 ? 'success' : 'error'}
                            size="small"
                          />
                          
                          <div className="flex gap-2 mt-4">
                            <MaterialButton
                              size="small"
                              variant="outlined"
                              startIcon={<Edit />}
                            >
                              Edit
                            </MaterialButton>
                            <MaterialButton
                              size="small"
                              variant="outlined"
                              color="error"
                              startIcon={<Delete />}
                              onClick={() => removeItem(item.id)}
                            >
                              Delete
                            </MaterialButton>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>

          {/* Floating Action Button */}
          <motion.div
            className="fixed bottom-8 right-8"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 1, type: "spring", stiffness: 200 }}
          >
            <motion.div
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <Fab
                color="primary"
                onClick={addItem}
                sx={{
                  background: 'linear-gradient(45deg, #3B82F6, #8B5CF6)',
                  '&:hover': {
                    background: 'linear-gradient(45deg, #2563EB, #7C3AED)',
                  }
                }}
              >
                <Add />
              </Fab>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
