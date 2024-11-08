// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract HotelBooking {
    address public owner;
    address public managerWallet;
    mapping(address => bool) public managers;

    struct Room {
        uint256 id;
        uint256 roomNum;
        uint256 price;  // Price per day
        bool isBooked;
        address bookedBy;
        string category;
        bool checkedIn;
        uint256 checkInTimestamp;
        uint256 checkOutTimestamp;
    }

    Room[] public rooms;
    mapping(uint256 => uint256) public roomEscrow;  // Track escrow amounts by room ID
    uint256 public nextRoomId = 0;

    constructor(address _managerWallet) {
        owner = msg.sender;
        managerWallet = _managerWallet;
        managers[owner] = true;

        // Initialize rooms
        rooms.push(Room(nextRoomId++, 201, 0.01 ether, false, address(0), "Premium", false, 0, 0));
        rooms.push(Room(nextRoomId++, 202, 0.01 ether, false, address(0), "Premium", false, 0, 0));
        rooms.push(Room(nextRoomId++, 203, 0.01 ether, false, address(0), "Premium", false, 0, 0));
        rooms.push(Room(nextRoomId++, 204, 0.02 ether, false, address(0), "Deluxe", false, 0, 0));
        rooms.push(Room(nextRoomId++, 205, 0.02 ether, false, address(0), "Deluxe", false, 0, 0));
        rooms.push(Room(nextRoomId++, 206, 0.02 ether, false, address(0), "Deluxe", false, 0, 0));
    }

    modifier onlyManager() {
        require(managers[msg.sender], "Only managers can perform this action");
        _;
    }

    modifier onlyCustomer(uint _roomId) {
        require(rooms[_roomId].bookedBy == msg.sender, "Only the customer who booked can cancel");
        _;
    }

    function bookRoom(uint _roomId, uint256 _checkInTimestamp, uint256 _checkOutTimestamp) public payable {
        require(_roomId < rooms.length, "Room does not exist");
        Room storage room = rooms[_roomId];
        require(!room.isBooked, "Room already booked");
        require(_checkInTimestamp < _checkOutTimestamp, "Invalid dates");

        uint256 numDays = (_checkOutTimestamp - _checkInTimestamp) / 1 days;
        uint256 totalPrice = room.price * numDays;

        require(msg.value == totalPrice, "Incorrect payment amount");

        room.isBooked = true;
        room.bookedBy = msg.sender;
        room.checkInTimestamp = _checkInTimestamp;
        room.checkOutTimestamp = _checkOutTimestamp;

        roomEscrow[_roomId] = msg.value; // Hold payment in escrow
    }

    function cancelBooking(uint _roomId) public onlyCustomer(_roomId) {
        Room storage room = rooms[_roomId];
        require(room.isBooked, "Room is not booked");
        require(!room.checkedIn, "Cannot cancel after check-in");

        room.isBooked = false;
        address customer = room.bookedBy;
        room.bookedBy = address(0);

        uint256 escrowAmount = roomEscrow[_roomId];
        roomEscrow[_roomId] = 0; // Reset escrow

        (bool refunded, ) = customer.call{value: escrowAmount}("");
        require(refunded, "Refund failed");
    }

    function checkIn(uint _roomId) public onlyManager {
        Room storage room = rooms[_roomId];
        require(room.isBooked, "Room is not booked");
        require(!room.checkedIn, "Already checked in");

        room.checkedIn = true;  // Mark as checked-in
        uint256 escrowAmount = roomEscrow[_roomId];
        roomEscrow[_roomId] = 0; // Clear escrow

        // Transfer funds to the manager's wallet
        (bool sent, ) = managerWallet.call{value: escrowAmount}("");
        require(sent, "Payment to manager failed");
    }

    function checkoutRoom(uint256 _roomId) public onlyManager {
        Room storage room = rooms[_roomId];
        require(room.checkedIn, "Room is not checked in");

        room.isBooked = false;
        room.checkedIn = false;  // Mark as not checked in
        room.bookedBy = address(0);  // Clear the bookedBy address
        room.checkInTimestamp = 0;
        room.checkOutTimestamp = 0;
    }

    function getRooms() public view returns (Room[] memory) {
        return rooms;
    }

}
