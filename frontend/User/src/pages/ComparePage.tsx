
import React, { useState } from "react";
import { useStore } from "../store/useStore";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { Star, MapPin, Shield, ChevronLeft, ChevronRight, Eye } from "lucide-react";
import { Link } from "react-router-dom";
import { HouseDetailsModal } from "./HouseDetailsModal";
import FilterModal from "../components/FilterModal";
import { House } from "../types";

export const ComparePage: React.FC = () => {
  const { compareList, removeFromCompare, houses } = useStore();
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedHouse, setSelectedHouse] = useState<House | null>(null);
  const [carouselIdx, setCarouselIdx] = useState<{[id: string]: number}>({});
  const [filterModalOpen, setFilterModalOpen] = useState(false);
  const [filterSelectedHouse, setFilterSelectedHouse] = useState<House | null>(null);
  const [filterDetailsOpen, setFilterDetailsOpen] = useState(false);

  const handleOpenModal = (house: House) => {
    setSelectedHouse(house);
    setModalOpen(true);
  };
  const handleCloseModal = () => {
    setModalOpen(false);
    setSelectedHouse(null);
  };

  const handlePrevImg = (houseId: string, images: string[]) => {
    setCarouselIdx(idx => ({
      ...idx,
      [houseId]: (idx[houseId] ?? 0) === 0 ? images.length - 1 : (idx[houseId] ?? 0) - 1
    }));
  };
  const handleNextImg = (houseId: string, images: string[]) => {
    setCarouselIdx(idx => ({
      ...idx,
      [houseId]: (idx[houseId] ?? 0) === images.length - 1 ? 0 : (idx[houseId] ?? 0) + 1
    }));
  };

  return (
  <div className="w-full px-4 md:px-8 py-8">
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-3xl font-bold">Compare Houses</h1>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setFilterModalOpen(true)}>
            Filter
          </Button>
          <Link to="/">
            <Button variant="outline">Back to Listings</Button>
          </Link>
        </div>
      </div>
      {compareList.length === 0 ? (
        <div className="text-center text-muted-foreground py-16">
          <p>No houses added to compare yet.</p>
          <Link to="/">
            <Button className="mt-4">Browse Houses</Button>
          </Link>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 min-w-[900px]">
            {compareList.map((house) => {
              const idx = carouselIdx[house.id] ?? 0;
              return (
                <Card key={house.id} className="relative">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      {house.title}
                      {house.verification.verified && (
                        <Shield className="h-4 w-4 text-blue-500" />
                      )}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="relative w-full h-40 mb-2">
                      <img src={house.images[idx]} alt={house.title} className="w-full h-40 object-cover rounded-lg" />
                      {house.images.length > 1 && (
                        <>
                          <button className="absolute left-2 top-1/2 -translate-y-1/2 bg-background/80 rounded-full p-1 shadow hover:bg-primary/20 transition" onClick={() => handlePrevImg(house.id, house.images)}>
                            <ChevronLeft className="h-5 w-5" />
                          </button>
                          <button className="absolute right-2 top-1/2 -translate-y-1/2 bg-background/80 rounded-full p-1 shadow hover:bg-primary/20 transition" onClick={() => handleNextImg(house.id, house.images)}>
                            <ChevronRight className="h-5 w-5" />
                          </button>
                        </>
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <MapPin className="h-4 w-4" />
                      <span>{house.location.estate}, {house.location.address}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Star className="h-4 w-4 text-yellow-500" />
                      <span className="font-medium">{typeof house.rating === 'number' ? house.rating.toFixed(1) : 'N/A'}</span>
                      <span className="text-xs">({Array.isArray(house.reviews) ? house.reviews.length : 0} reviews)</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-primary text-lg">KSh {house.price.toLocaleString()}</span>
                      <span className="text-xs text-muted-foreground">/month</span>
                    </div>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {house.amenities.filter(a => a.available).map(a => (
                        <span key={a.name} className="px-2 py-1 rounded bg-secondary text-xs">
                          {a.name}
                        </span>
                      ))}
                    </div>
                    <div className="flex gap-2 mt-3">
                      <Button variant="destructive" size="sm" onClick={() => removeFromCompare(house.id)}>
                        Remove
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => handleOpenModal(house)}>
                        <Eye className="h-4 w-4 mr-1" /> View Details
                      </Button>
                    </div>
                  </CardContent>
                </Card>

              );
            })}
          </div>
        </div>
      )}
      <HouseDetailsModal house={selectedHouse} isOpen={modalOpen} onClose={handleCloseModal} />
      <FilterModal
        isOpen={filterModalOpen}
        onClose={() => {
          setFilterModalOpen(false);
          setFilterSelectedHouse(null);
          setFilterDetailsOpen(false);
        }}
        houses={houses}
        onSelectHouse={(house) => {
          setFilterSelectedHouse(house);
          setFilterDetailsOpen(true);
        }}
      />
      <HouseDetailsModal
        house={filterSelectedHouse}
        isOpen={filterDetailsOpen}
        onClose={() => setFilterDetailsOpen(false)}
      />

    </div>
  );
}
