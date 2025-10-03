import React from 'react';
import { Apple } from 'lucide-react';

export default function GlassDemo() {
  return (
    <div className="min-h-screen bg-gradient-mesh p-8 animate-fade-in">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="glass-card p-8 animate-scale-in">
          <h1 className="text-large-title mb-2 flex items-center gap-2">
            <Apple className="w-8 h-8" /> Glassmorphism UI
          </h1>
          <p className="text-body text-secondary">
            Apple-inspired liquid glass design system
          </p>
        </div>

        {/* Buttons Section */}
        <div className="glass-card p-6">
          <h2 className="text-title-2 mb-6">Buttons</h2>
          <div className="flex flex-wrap gap-4">
            <button className="glass-button-primary px-6 py-3">
              Primary Action
            </button>
            <button className="glass-button px-6 py-3">Secondary Action</button>
            <button className="glass-button px-6 py-3" disabled>
              Disabled
            </button>
          </div>
        </div>

        {/* Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="apple-card">
            <span className="apple-badge mb-4">NEW</span>
            <h3 className="text-title-3 mb-2">Glass Card</h3>
            <p className="text-body text-secondary">
              Elevated surface with shadow and hover effect
            </p>
          </div>

          <div className="glass-card p-6">
            <h3 className="text-title-3 mb-2">Glass Effect</h3>
            <p className="text-body text-secondary">
              Translucent background with blur
            </p>
          </div>

          <div className="apple-card">
            <h3 className="text-title-3 mb-2">Apple Card</h3>
            <p className="text-body text-secondary">
              System background with smooth animations
            </p>
          </div>
        </div>

        {/* Form Elements */}
        <div className="glass-card p-6">
          <h2 className="text-title-2 mb-6">Form Elements</h2>
          <div className="space-y-4">
            <div>
              <label className="text-headline block mb-2">Text Input</label>
              <input
                type="text"
                className="glass-input w-full"
                placeholder="Enter your text..."
              />
            </div>

            <div>
              <label className="text-headline block mb-2">Textarea</label>
              <textarea
                className="glass-input w-full"
                rows={4}
                placeholder="Enter description..."
              />
            </div>
          </div>
        </div>

        {/* List Items */}
        <div className="glass-card p-6">
          <h2 className="text-title-2 mb-6">List Items</h2>
          <div className="space-y-2">
            <div className="apple-list-item">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-headline">First Item</h4>
                  <p className="text-footnote text-secondary">
                    With hover effect
                  </p>
                </div>
                <span className="apple-badge">Active</span>
              </div>
            </div>

            <div className="apple-list-item">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-headline">Second Item</h4>
                  <p className="text-footnote text-secondary">
                    Interactive element
                  </p>
                </div>
                <span className="apple-badge">New</span>
              </div>
            </div>

            <div className="apple-list-item">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-headline">Third Item</h4>
                  <p className="text-footnote text-secondary">
                    Smooth transition
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="glass-card p-6">
          <h2 className="text-title-2 mb-6">Progress</h2>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-footnote text-secondary mb-2">
                <span>Completion</span>
                <span>75%</span>
              </div>
              <div className="apple-progress">
                <div
                  className="apple-progress-bar"
                  style={{ width: '75%' }}
                ></div>
              </div>
            </div>
          </div>
        </div>

        {/* Typography Showcase */}
        <div className="glass-card p-6">
          <h2 className="text-title-2 mb-6">Typography</h2>
          <div className="space-y-4">
            <div>
              <p className="text-large-title">Large Title</p>
              <p className="text-footnote text-secondary">34px, Bold</p>
            </div>
            <div className="apple-divider"></div>
            <div>
              <p className="text-title-1">Title 1</p>
              <p className="text-footnote text-secondary">28px, Bold</p>
            </div>
            <div className="apple-divider"></div>
            <div>
              <p className="text-title-2">Title 2</p>
              <p className="text-footnote text-secondary">22px, Semibold</p>
            </div>
            <div className="apple-divider"></div>
            <div>
              <p className="text-headline">Headline</p>
              <p className="text-footnote text-secondary">17px, Semibold</p>
            </div>
            <div className="apple-divider"></div>
            <div>
              <p className="text-body">Body Text</p>
              <p className="text-footnote text-secondary">17px, Regular</p>
            </div>
          </div>
        </div>

        {/* Color Palette */}
        <div className="glass-card p-6">
          <h2 className="text-title-2 mb-6">Apple Colors</h2>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div>
              <div
                className="h-20 rounded-xl"
                style={{ background: '#007AFF' }}
              ></div>
              <p className="text-caption-1 text-secondary mt-2 text-center">
                Blue
              </p>
            </div>
            <div>
              <div
                className="h-20 rounded-xl"
                style={{ background: '#5856D6' }}
              ></div>
              <p className="text-caption-1 text-secondary mt-2 text-center">
                Indigo
              </p>
            </div>
            <div>
              <div
                className="h-20 rounded-xl"
                style={{ background: '#AF52DE' }}
              ></div>
              <p className="text-caption-1 text-secondary mt-2 text-center">
                Purple
              </p>
            </div>
            <div>
              <div
                className="h-20 rounded-xl"
                style={{ background: '#34C759' }}
              ></div>
              <p className="text-caption-1 text-secondary mt-2 text-center">
                Green
              </p>
            </div>
            <div>
              <div
                className="h-20 rounded-xl"
                style={{ background: '#FF3B30' }}
              ></div>
              <p className="text-caption-1 text-secondary mt-2 text-center">
                Red
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="glass-card p-6 text-center">
          <p className="text-body text-secondary">
            Built with Apple Human Interface Guidelines
          </p>
          <p className="text-footnote text-tertiary mt-2">
            Glassmorphism • Animations • Responsive
          </p>
        </div>
      </div>
    </div>
  );
}
