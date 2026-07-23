'use client'

import React, { useState, useEffect, useRef } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/app/components/ui/dialog'
import { Button } from '@/app/components/ui/button'
import { Input } from '@/app/components/ui/input'
import { Label } from '@/app/components/ui/label'
import { Badge } from '@/app/components/ui/badge'
import { Skeleton } from '@/app/components/ui/skeleton'
import { Separator } from '@/app/components/ui/separator'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/app/components/ui/select'
import { ScrollArea } from '@/app/components/ui/scroll-area'
import { Card } from '@/app/components/ui/card'
import { SpinnerGap, X, ShoppingCart } from 'phosphor-react'
import { Search, Trash2, AlertCircle, Info } from 'lucide-react'

export default function StockOrderDialog({ id, isOpen, onClose, pass, role, onSuccess }) {

    // ── Dealer search ─────────────────────────────────────────────────────
    const [dealerQuery, setDealerQuery] = useState('')
    const [dealerResults, setDealerResults] = useState([])
    const [searchingDealers, setSearchingDealers] = useState(false)
    const [selectedDealer, setSelectedDealer] = useState(null)
    const [showDealerDrop, setShowDealerDrop] = useState(false)
    const dealerTimer = useRef(null)
    const dealerRef = useRef(null)

    // ── Design search ─────────────────────────────────────────────────────
    const [designQuery, setDesignQuery] = useState('')
    const [designResults, setDesignResults] = useState([])
    const [searchingDesigns, setSearchingDesigns] = useState(false)
    const [showDesignDrop, setShowDesignDrop] = useState(false)
    const designTimer = useRef(null)
    const designRef = useRef(null)

    // ── Cart ──────────────────────────────────────────────────────────────
    const [cartItems, setCartItems] = useState([])  // { product, stockType, quantity, error }

    // ── Ordering ──────────────────────────────────────────────────────────
    const [placing, setPlacing] = useState(false)
    const [orderError, setOrderError] = useState(null)

    // ── Reset on dialog close ─────────────────────────────────────────────
    useEffect(() => {
        if (!isOpen) {
            setDealerQuery(''); setDealerResults([]); setSelectedDealer(null); setShowDealerDrop(false)
            setDesignQuery(''); setDesignResults([]); setShowDesignDrop(false)
            setCartItems([]); setPlacing(false); setOrderError(null)
        }
    }, [isOpen])

    // ── Close dropdowns when clicking outside ────────────────────────────
    useEffect(() => {
        const handler = (e) => {
            if (dealerRef.current && !dealerRef.current.contains(e.target)) setShowDealerDrop(false)
            if (designRef.current && !designRef.current.contains(e.target)) setShowDesignDrop(false)
        }
        document.addEventListener('mousedown', handler)
        return () => document.removeEventListener('mousedown', handler)
    }, [])

    // ── Dealer search ─────────────────────────────────────────────────────
    const handleDealerSearch = (value) => {
        setDealerQuery(value)
        setSelectedDealer(null)
        clearTimeout(dealerTimer.current)
        if (!value.trim()) { setDealerResults([]); setShowDealerDrop(false); return }
        dealerTimer.current = setTimeout(async () => {
            setSearchingDealers(true)
            try {
                const res = await fetch(`/api/v2/user/${pass}/U9.1/${role}/${encodeURIComponent(value)}`, {
                    headers: { 'Content-Type': 'application/json' },
                })
                const data = await res.json()
                setDealerResults(data.status === 200 ? data.data : [])
                setShowDealerDrop(true)
            } catch { setDealerResults([]) }
            finally { setSearchingDealers(false) }
        }, 400)
    }

    const selectDealer = (dealer) => {
        setSelectedDealer(dealer)
        setDealerQuery('')
        setShowDealerDrop(false)
        setDealerResults([])
    }

    // ── Design search ─────────────────────────────────────────────────────
    const handleDesignSearch = (value) => {
        setDesignQuery(value)
        clearTimeout(designTimer.current)
        if (!value.trim()) { setDesignResults([]); setShowDesignDrop(false); return }
        designTimer.current = setTimeout(async () => {
            setSearchingDesigns(true)
            try {
                const res = await fetch(`/api/v2/products/${pass}/U4/${encodeURIComponent(value)}/0`, {
                    headers: { 'Content-Type': 'application/json' },
                })
                const data = await res.json()
                setDesignResults(data.status === 200 ? data.data : [])
                setShowDesignDrop(true)
            } catch { setDesignResults([]) }
            finally { setSearchingDesigns(false) }
        }, 400)
    }

    const addToCart = (product) => {
        if (cartItems.some(i => i.product.productId === product.productId)) {
            setDesignQuery(''); setDesignResults([]); setShowDesignDrop(false); return
        }
        setCartItems(prev => [...prev, { product, stockType: 'prm', quantity: '', error: null }])
        setDesignQuery(''); setDesignResults([]); setShowDesignDrop(false)
    }

    // ── Cart item update & validation ─────────────────────────────────────
    const updateItem = (productId, field, value) => {
        setCartItems(prev => prev.map(i => {
            if (i.product.productId !== productId) return i
            const updated = { ...i, [field]: value }
            const qty = Number(field === 'quantity' ? value : updated.quantity)
            const type = field === 'stockType' ? value : updated.stockType
            const availPrm = Number(updated.product.prm) || 0
            const availStd = Number(updated.product.std) || 0

            if (!value && field === 'quantity') {
                updated.error = null // empty — will catch at submit
            } else if (qty < 1) {
                updated.error = 'Quantity must be at least 1'
            } else if (type === 'std' && qty > availStd) {
                updated.error = `Max available STD stock is ${availStd}`
            } else {
                updated.error = null
            }
            return updated
        }))
    }

    const removeFromCart = (productId) => setCartItems(prev => prev.filter(i => i.product.productId !== productId))

    // ── Build the designs array for the request body ──────────────────────
    // PRM rule: if qty > available, split into (available, isProduction=false) + (rest, isProduction=true)
    // STD rule: qty <= available, single entry, isProduction=false
    const buildDesignsArray = () => {
        
        
        const designs = []
        const atlCartId = `C${Date.now()}`
        const vclCartId = `C${Date.now()+1}`
        let serialId = 1
        for (const item of cartItems) {
            
            const qty = Number(item.quantity)
            const availPrm = Number(item.product.prm) || 0
            if (item.stockType === 'prm' && qty > availPrm) {
                if (availPrm > 0) {
                    designs.push({ cartId: (item.product.designType == 1) ? atlCartId : vclCartId,  serialId: serialId++, dealerId: selectedDealer.id, productId: item.product.productId, design: item.product.design, quantity: availPrm, stockType: 'prm', isProduction: false })
                }
                designs.push({ cartId: (item.product.designType == 1) ? atlCartId : vclCartId, serialId: serialId++, dealerId: selectedDealer.id, productId: item.product.productId, design: item.product.design, quantity: qty - availPrm, stockType: 'prm', isProduction: true })
            } else {
                designs.push({ cartId: (item.product.designType == 1) ? atlCartId : vclCartId, serialId: serialId++, dealerId: selectedDealer.id, productId: item.product.productId, design: item.product.design, quantity: qty, stockType: item.stockType, isProduction: false })
            }
        }
        return designs
    }

    // ── Place order ───────────────────────────────────────────────────────
    const hasErrors = cartItems.some(i => i.error)
    const hasEmptyQty = cartItems.some(i => !i.quantity || Number(i.quantity) < 1)
    const canPlace = selectedDealer && cartItems.length > 0 && !hasErrors && !hasEmptyQty && !placing

    const handlePlaceOrder = async () => {
        if (!canPlace) return
        setPlacing(true); setOrderError(null)
        try {
            const now = new Date()
            const p = (n) => String(n).padStart(2, '0')
            const createdOn = `${now.getFullYear()}-${p(now.getMonth() + 1)}-${p(now.getDate())} ${p(now.getHours())}:${p(now.getMinutes())}:${p(now.getSeconds())}`

            const body = {
                userId: id,
                designs: buildDesignsArray(),
                createdOn,
            }

            const res = await fetch(`/api/v2/orders_test/${pass}/U4`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body),
            })
            const data = await res.json()

            if (data.status === 200 && data.data > 0) {
                onSuccess?.(`Stock order placed! ${data.data} reservation${data.data !== 1 ? 's' : ''} created for ${selectedDealer.name}.`)
                onClose()
            } else {
                setOrderError(data.message || 'Order failed. Please try again.')
            }
        } catch (e) {
            setOrderError('Network error. Please try again.')
        } finally {
            setPlacing(false)
        }
    }

    const totalBoxes = cartItems.reduce((s, i) => s + (Number(i.quantity) || 0), 0)

    return (
        <Dialog open={isOpen} onOpenChange={(open) => { if (!open) onClose() }}>
            <DialogContent className="max-w-2xl h-[600px] flex flex-col gap-0 p-0 overflow-hidden">
                {/* Header */}
                <DialogHeader className="px-6 pt-6 pb-4 border-b">
                    <DialogTitle className="flex items-center gap-2">
                        <ShoppingCart className="h-5 w-5 text-green-600" />
                        Add Stock Order
                    </DialogTitle>
                </DialogHeader>

                <div className="flex flex-col gap-4 px-6 pt-4 pb-2 overflow-y-auto flex-1 min-h-0">

                    {/* ── Dealer section ── */}
                    <div className="space-y-1.5" ref={dealerRef}>
                        <Label className="text-sm font-medium">Dealer</Label>
                        {selectedDealer ? (
                            <div className="flex items-center gap-2 px-3 py-2 bg-green-50 border border-green-200 rounded-md">
                                <div className="flex-1">
                                    <span className="font-medium text-sm text-green-800">{selectedDealer.name}</span>
                                    <span className="text-xs text-green-600 ml-2 font-mono">{selectedDealer.id}</span>
                                </div>
                                <Button size="icon" variant="ghost" className="h-6 w-6 text-green-600 hover:text-red-500 hover:bg-transparent"
                                    onClick={() => { setSelectedDealer(null); setCartItems([]) }}>
                                    <X className="h-3.5 w-3.5" />
                                </Button>
                            </div>
                        ) : (
                            <div className="relative">
                                <Input
                                    placeholder="Search dealer by name or ID..."
                                    value={dealerQuery}
                                    onChange={(e) => handleDealerSearch(e.target.value)}
                                    onFocus={() => dealerResults.length > 0 && setShowDealerDrop(true)}
                                    className="pr-9"
                                />
                                {searchingDealers
                                    ? <SpinnerGap className="absolute right-3 top-2.5 h-4 w-4 animate-spin text-gray-400" />
                                    : <Search className="absolute right-3 top-2.5 h-4 w-4 text-gray-400" />
                                }
                                {showDealerDrop && dealerResults.length > 0 && (
                                    <div className="absolute z-50 mt-1 w-full bg-white border rounded-md shadow-lg max-h-48 overflow-y-auto">
                                        {dealerResults.map(d => (
                                            <div key={d.id} className="px-3 py-2 hover:bg-gray-50 cursor-pointer flex items-center justify-between"
                                                onMouseDown={() => selectDealer(d)}>
                                                <span className="font-medium text-sm">{d.name}</span>
                                                <span className="font-mono text-xs text-gray-400">{d.id}</span>
                                            </div>
                                        ))}
                                    </div>
                                )}
                                {showDealerDrop && !searchingDealers && dealerResults.length === 0 && dealerQuery.trim() && (
                                    <div className="absolute z-50 mt-1 w-full bg-white border rounded-md shadow p-3 text-sm text-gray-500">
                                        No dealers found
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    {/* ── Design search (only after dealer selected) ── */}
                    {selectedDealer && (
                        <>
                            <Separator />
                            <div className="space-y-1.5" ref={designRef}>
                                <Label className="text-sm font-medium">Add Design</Label>
                                <div className="relative">
                                    <Input
                                        placeholder="Search by design code or name..."
                                        value={designQuery}
                                        onChange={(e) => handleDesignSearch(e.target.value)}
                                        onFocus={() => designResults.length > 0 && setShowDesignDrop(true)}
                                        className="pr-9"
                                    />
                                    {searchingDesigns
                                        ? <SpinnerGap className="absolute right-3 top-2.5 h-4 w-4 animate-spin text-gray-400" />
                                        : <Search className="absolute right-3 top-2.5 h-4 w-4 text-gray-400" />
                                    }
                                    {showDesignDrop && designResults.length > 0 && (
                                        <div className="absolute z-50 mt-1 w-full bg-white border rounded-md shadow-lg max-h-52 overflow-y-auto">
                                            {designResults.map(p => {
                                                const alreadyAdded = cartItems.some(i => i.product.productId === p.productId)
                                                return (
                                                    <div key={p.productId}
                                                        className={`px-3 py-2.5 flex items-center justify-between ${alreadyAdded ? 'opacity-40 cursor-not-allowed bg-gray-50' : 'hover:bg-gray-50 cursor-pointer'}`}
                                                        onMouseDown={() => !alreadyAdded && addToCart(p)}>
                                                        <div>
                                                            <span className="font-medium text-sm">{p.name}</span>
                                                            <span className="font-mono text-xs text-gray-400 ml-2">{p.design}</span>
                                                        </div>
                                                        <div className="flex gap-3 text-xs">
                                                            <span className="text-violet-600 font-medium">PRM <span className="font-bold">{p.prm ?? 0}</span></span>
                                                            <span className="text-blue-600 font-medium">STD <span className="font-bold">{p.std ?? 0}</span></span>
                                                            {alreadyAdded && <Badge variant="secondary" className="text-[10px] py-0 px-1.5">Added</Badge>}
                                                        </div>
                                                    </div>
                                                )
                                            })}
                                        </div>
                                    )}
                                    {showDesignDrop && !searchingDesigns && designResults.length === 0 && designQuery.trim() && (
                                        <div className="absolute z-50 mt-1 w-full bg-white border rounded-md shadow p-3 text-sm text-gray-500">
                                            No designs found
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* ── Cart items ── */}
                            {cartItems.length > 0 && (
                                <div className="space-y-2">
                                    <Label className="text-sm font-medium">Order Items</Label>
                                    <div className="space-y-2">
                                        {cartItems.map(item => {
                                            const availPrm = Number(item.product.prm) || 0
                                            const availStd = Number(item.product.std) || 0
                                            const qty = Number(item.quantity) || 0
                                            const isPrmSplit = item.stockType === 'prm' && qty > availPrm
                                            const splitProduction = qty - availPrm

                                            return (
                                                <Card key={item.product.productId} className={`p-3 ${item.error ? 'border-red-200 bg-red-50' : ''}`}>
                                                    <div className="flex items-start gap-3">
                                                        <div className="flex-1 min-w-0">
                                                            <div className="font-semibold text-sm truncate">{item.product.name}</div>
                                                            <div className="font-mono text-xs text-gray-400">{item.product.design}</div>
                                                            <div className="flex gap-3 mt-1 text-xs">
                                                                <span className="text-violet-600">PRM: <b>{availPrm}</b></span>
                                                                <span className="text-blue-600">STD: <b>{availStd}</b></span>
                                                            </div>
                                                        </div>

                                                        <div className="flex items-center gap-2 shrink-0">
                                                            <Select value={item.stockType}
                                                                onValueChange={v => updateItem(item.product.productId, 'stockType', v)}>
                                                                <SelectTrigger className="w-[72px] h-8 text-xs">
                                                                    <SelectValue />
                                                                </SelectTrigger>
                                                                <SelectContent>
                                                                    <SelectItem value="prm">PRM</SelectItem>
                                                                    <SelectItem value="std">STD</SelectItem>
                                                                </SelectContent>
                                                            </Select>

                                                            <Input
                                                                type="number"
                                                                min={1}
                                                                max={item.stockType === 'std' ? availStd : undefined}
                                                                placeholder="Qty"
                                                                value={item.quantity}
                                                                onChange={e => updateItem(item.product.productId, 'quantity', e.target.value)}
                                                                className="w-20 h-8 text-sm"
                                                            />

                                                            <Button size="icon" variant="ghost"
                                                                className="h-8 w-8 text-gray-300 hover:text-red-500 hover:bg-red-50"
                                                                onClick={() => removeFromCart(item.product.productId)}>
                                                                <Trash2 className="h-3.5 w-3.5" />
                                                            </Button>
                                                        </div>
                                                    </div>

                                                    {/* Error */}
                                                    {item.error && (
                                                        <div className="flex items-center gap-1 mt-1.5 text-xs text-red-600">
                                                            <AlertCircle className="h-3 w-3" /> {item.error}
                                                        </div>
                                                    )}

                                                    {/* PRM split info */}
                                                    {!item.error && isPrmSplit && (
                                                        <div className="flex items-start gap-1 mt-1.5 text-xs text-amber-700 bg-amber-50 rounded px-2 py-1">
                                                            <Info className="h-3 w-3 mt-0.5 shrink-0" />
                                                            <span>
                                                                {availPrm > 0
                                                                    ? <><b>{availPrm}</b> from stock + <b>{splitProduction}</b> as production order</>
                                                                    : <><b>{qty}</b> added as production order (no PRM stock available)</>
                                                                }
                                                            </span>
                                                        </div>
                                                    )}
                                                </Card>
                                            )
                                        })}
                                    </div>
                                </div>
                            )}
                        </>
                    )}

                    {/* ── Order-level error ── */}
                    {orderError && (
                        <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md px-3 py-2">
                            <AlertCircle className="h-4 w-4 shrink-0" /> {orderError}
                        </div>
                    )}
                </div>

                {/* ── Footer ── */}
                <div className="flex items-center justify-between px-6 py-4 border-t bg-gray-50/60">
                    <div className="text-sm text-gray-500">
                        {cartItems.length > 0
                            ? <>{cartItems.length} design{cartItems.length !== 1 ? 's' : ''} · <b>{totalBoxes}</b> box{totalBoxes !== 1 ? 'es' : ''}</>
                            : <span className="text-gray-400">No items added yet</span>
                        }
                    </div>
                    <div className="flex gap-2">
                        <Button variant="outline" onClick={onClose} disabled={placing}>Cancel</Button>
                        <Button
                            onClick={handlePlaceOrder}
                            disabled={!canPlace}
                            className="bg-green-600 hover:bg-green-700 text-white"
                        >
                            {placing
                                ? <><SpinnerGap className="mr-1.5 h-4 w-4 animate-spin" />Placing...</>
                                : 'Place Order'
                            }
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    )
}
