import React, { useRef } from 'react';
import { useAssessmentStore } from '../hooks/useAssessmentStore';
import { importAssessment } from '../utils/storage';
import { objectiveOptions } from '../constants/objectives';
import Dialog from './ui/Dialog';
import { ButtonShadcn as Button } from '@/components/ui/button-shadcn';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { formatBudgetAmount } from '../utils/format';
import { Info } from 'lucide-react';

const Toolbar = ({ open, onClose }) => {
  const fileRef = useRef();
  const state = useAssessmentStore();
  const setMetadata = useAssessmentStore((s) => s.setMetadata);
  const importState = useAssessmentStore((s) => s.importState);

  const objectives = state.currentAssessment.metadata.objectives || [];
  const socRegions = state.currentAssessment.metadata.socRegion || [];

  const handleImport = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    try {
      const data = await importAssessment(file);
      importState(data);
    } catch (error) {
      alert('Unable to import file. Please verify JSON format.');
    }
  };

  const toggleObjective = (objective) => {
    const updated = objectives.includes(objective)
      ? objectives.filter((item) => item !== objective)
      : [...objectives, objective];
    setMetadata({ objectives: updated });
  };

  const toggleRegion = (region) => {
    const updated = socRegions.includes(region)
      ? socRegions.filter((item) => item !== region)
      : [...socRegions, region];
    setMetadata({ socRegion: updated });
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title="Metadata & Controls"
      description="Offline by default. Update assessment metadata and objectives as your engagement evolves."
      footer={
        <div className="metadata-header-actions">
          <Button variant="secondary" onClick={() => fileRef.current?.click()}>
            Import
          </Button>
          <Button variant="primary" onClick={onClose}>
            Close
          </Button>
        </div>
      }
    >
      <input type="file" accept="application/json" ref={fileRef} style={{ display: 'none' }} onChange={handleImport} />

      <div className="metadata-modal metadata-modal-card">
        <div className="metadata-divider" role="presentation">
          <span>Info</span>
        </div>
        <div className="metadata-section">
          <div className="metadata-section-label">Info</div>
          <div className="metadata-section-grid">
            <div className="metadata-field">
              <label>Assessment title</label>
              <input
                value={state.currentAssessment.metadata.assessmentTitle}
                onChange={(e) => setMetadata({ assessmentTitle: e.target.value })}
              />
            </div>
            <div className="metadata-field">
              <label>Organization name</label>
              <input
                value={state.currentAssessment.metadata.name}
                onChange={(e) => setMetadata({ name: e.target.value })}
              />
            </div>
            <div className="metadata-field">
              <label>Sector</label>
              <Select
                value={state.currentAssessment.metadata.sector}
                onValueChange={(value) => setMetadata({ sector: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="MSSP">MSSP</SelectItem>
                  <SelectItem value="Technology">Technology</SelectItem>
                  <SelectItem value="Finance">Finance</SelectItem>
                  <SelectItem value="Healthcare">Healthcare</SelectItem>
                  <SelectItem value="Government">Government</SelectItem>
                  <SelectItem value="Manufacturing">Manufacturing</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="metadata-field">
              <label>SOC Age</label>
              <Select
                value={state.currentAssessment.metadata.socAge}
                onValueChange={(value) => setMetadata({ socAge: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select SOC age" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="0-6 months">0-6 months</SelectItem>
                  <SelectItem value="6-12 months">6-12 months</SelectItem>
                  <SelectItem value="1-2 years">1-2 years</SelectItem>
                  <SelectItem value="2-5 years">2-5 years</SelectItem>
                  <SelectItem value="5+ years">5+ years</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="metadata-field">
              <label>SOC FTE</label>
              <input
                value={state.currentAssessment.metadata.size}
                onChange={(e) => setMetadata({ size: e.target.value })}
                placeholder="30"
              />
            </div>
            <div className="metadata-field">
              <label>Business Size (FTE)</label>
              <input
                value={state.currentAssessment.metadata.businessSize || ''}
                onChange={(e) => setMetadata({ businessSize: e.target.value })}
                placeholder="5000"
              />
            </div>
            <div className="metadata-field">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                <label style={{ margin: 0 }}>SOC Organisational Model</label>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Info style={{ width: '0.875rem', height: '0.875rem', color: 'hsl(var(--muted-foreground))', cursor: 'help' }} />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Reference: 11 Strategies of a World-Class CSOC</p>
                      <p>MITRE, Pages 54-55</p>
                      <a href="https://www.mitre.org/sites/default/files/2022-04/11-strategies-of-a-world-class-cybersecurity-operations-center.pdf" target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'underline' }}>
                        View Document
                      </a>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
              <Select
                value={state.currentAssessment.metadata.socOrgModel || ''}
                onValueChange={(value) => setMetadata({ socOrgModel: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select model" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Distributed SOC">Distributed SOC</SelectItem>
                  <SelectItem value="Centralised SOC">Centralised SOC</SelectItem>
                  <SelectItem value="Federated SOC">Federated SOC</SelectItem>
                  <SelectItem value="Coordinating SOC">Coordinating SOC</SelectItem>
                  <SelectItem value="Hierarchical SOC">Hierarchical SOC</SelectItem>
                  <SelectItem value="National SOC">National SOC</SelectItem>
                  <SelectItem value="MSSP SOC">MSSP SOC</SelectItem>
                  <SelectItem value="Hybrid SOC">Hybrid SOC</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="metadata-field" style={{ gridColumn: '1 / -1' }}>
              <label>SOC Region(s)</label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginTop: '0.5rem' }}>
                {['Asia', 'Australia/New Zealand', 'Canada', 'Europe', 'South America', 'North America', 'Middle East'].map((region) => (
                  <Button
                    key={region}
                    type="button"
                    variant={socRegions.includes(region) ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => toggleRegion(region)}
                  >
                    {region}
                  </Button>
                ))}
              </div>
            </div>
            <div className="metadata-field">
              <label>Geographic Operation</label>
              <Select
                value={state.currentAssessment.metadata.geoOperation || ''}
                onValueChange={(value) => setMetadata({ geoOperation: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select scope" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Regional">Regional</SelectItem>
                  <SelectItem value="National">National</SelectItem>
                  <SelectItem value="Continental">Continental</SelectItem>
                  <SelectItem value="Global">Global</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="metadata-field">
              <label>Status</label>
              <Select
                value={state.currentAssessment.metadata.status}
                onValueChange={(value) => setMetadata({ status: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Not Started">Not Started</SelectItem>
                  <SelectItem value="In Progress">In Progress</SelectItem>
                  <SelectItem value="Completed">Completed</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        <div className="metadata-divider" role="presentation">
          <span>Resources</span>
        </div>
        <div className="metadata-section">
          <div className="metadata-section-label">Resources</div>
          <div className="metadata-section-grid">
            <div className="metadata-field">
              <label>Budget amount</label>
              <input
                value={state.currentAssessment.metadata.budgetAmount}
                onChange={(e) =>
                  setMetadata({ budgetAmount: formatBudgetAmount(e.target.value) })
                }
                placeholder="e.g. 250000"
              />
            </div>
            <div className="metadata-field">
              <label>Currency</label>
              <Select
                value={state.currentAssessment.metadata.budgetCurrency}
                onValueChange={(value) => setMetadata({ budgetCurrency: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="$">USD ($)</SelectItem>
                  <SelectItem value="€">EUR (€)</SelectItem>
                  <SelectItem value="£">GBP (£)</SelectItem>
                  <SelectItem value="¥">JPY (¥)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        <div className="metadata-divider" role="presentation">
          <span>Objectives</span>
        </div>
        <div className="metadata-section">
          <div className="metadata-section-label">Objectives</div>
          <div className="flex flex-wrap gap-2">
            {objectiveOptions.map((option) => {
              const isSelected = objectives.includes(option);
              return (
                <Button
                  key={option}
                  type="button"
                  variant={isSelected ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => toggleObjective(option)}
                  className="rounded-full"
                >
                  {option}
                </Button>
              );
            })}
          </div>
        </div>
      </div>
    </Dialog>
  );
};

export default Toolbar;
