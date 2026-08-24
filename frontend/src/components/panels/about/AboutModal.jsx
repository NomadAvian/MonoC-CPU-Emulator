import ModalWrapper from '../../ui/ModalWrapper'
import githubIcon from '../../../assets/github.svg'
import monocIcon from '../../../assets/MonoCLogo.svg'
import './AboutModal.css'

export const ABOUT_TEXT = `MonoC is a 32-bit RISC-V CPU emulator and assembler built from scratch in C++.
Learn, write, assemble and run RV32I(+M) assembly in the browser.

This project was made for the course CSE299 by,
Walid Bin Reza
Toha Al Nur
Marshiat Mithe Syed`

export default function AboutModal({ onClose }) {
  return (
    <ModalWrapper onClose={onClose} className="about-modal">
      <img src={monocIcon} alt="MonoC Logo" className='about-modal__monoc-icon' />
      <p className="about-modal__text">{ABOUT_TEXT}</p>

      <div className="about-modal__meta">
        {/* <span className="about-modal__row"><span className="about-modal__key">Version</span>1.0.0</span> */}
        <span className="about-modal__row"><span className="about-modal__key">License</span>MIT</span>
        <a
          className="about-modal__row about-modal__link"
          href="https://github.com/NomadAvian/MonoC-CPU-Emulator"
          target="_blank"
          rel="noopener noreferrer"
        >
          <img src={githubIcon} alt="" className="about-modal__icon" />
          <span>GitHub Repository</span>
        </a>
      </div>
    </ModalWrapper>
  )
}
