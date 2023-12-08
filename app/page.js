'use client'
import { useRef } from "react"
import Modal from "./ui/app/Modal"
import Table from "./ui/app/Table"

export default function Home() {
const ref = useRef()
const modalref = useRef()
  return (
    <main className="justify-items-center min-h-screen">
    <Modal ref={modalref}></Modal>
    <div className="flex-box justify-center "><Table ref={ref}></Table></div>
    </main>
  )
}

